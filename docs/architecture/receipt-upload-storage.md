# Receipt Upload & Storage Architecture

**Status:** Approved for Implementation
**Priority:** 🟢 MEDIUM (Sprint 1, Week 2 / Phase 1 Week 7-8)
**Estimated Time:** 1-2 days
**Related PRD:** §7.1.6 Feedback Loop, §7.2 Security (90-day retention)

---

## 1. Overview

This document specifies the receipt photo upload and storage system for capturing actual till receipts to improve price accuracy and product matching.

**User Story:**
> As a user, I want to upload a photo of my receipt after shopping so that TillLess can verify pricing accuracy and improve future recommendations.

---

## 2. Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Storage | Supabase Storage | S3-compatible, pre-signed URLs, free tier 1GB |
| File Upload | Multipart form data | Standard HTTP upload |
| Metadata Storage | Prisma + PostgreSQL | Receipt records in database |
| Lifecycle Management | Supabase Storage Policy OR Cron Job | Automatic 90-day deletion |

---

## 3. Upload Workflow

```
┌─────────────┐
│  1. User    │
│  clicks     │
│  "Upload    │
│  Receipt"   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  2. Frontend│
│  requests   │
│  pre-signed │
│  upload URL │
└──────┬──────┘
       │ GET /api/receipts/upload-url?optimizationId={id}
       ▼
┌─────────────┐
│  3. Backend │
│  generates  │
│  signed URL │
│  (Supabase) │
└──────┬──────┘
       │ Returns: { uploadUrl, fileId }
       ▼
┌─────────────┐
│  4. Frontend│
│  uploads    │
│  directly to│
│  Supabase   │
└──────┬──────┘
       │ PUT {uploadUrl} with file
       ▼
┌─────────────┐
│  5. Frontend│
│  confirms   │
│  upload to  │
│  backend    │
└──────┬──────┘
       │ POST /api/receipts/confirm { fileId, actualTotal }
       ▼
┌─────────────┐
│  6. Backend │
│  stores     │
│  metadata   │
│  in DB      │
└─────────────┘
```

---

## 4. Endpoints Specification

### 4.1 Request Upload URL

**GET /api/receipts/upload-url**

**Query Parameters:**
- `optimizationId` (required): UUID of optimization result

**Request:**
```bash
GET /api/receipts/upload-url?optimizationId=550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer {token}
```

**Response Success (200 OK):**
```json
{
  "uploadUrl": "https://{supabase-project}.supabase.co/storage/v1/object/upload/sign/receipts/{path}?token={signed-token}",
  "fileId": "user-123/opt-550e8400/1737291600000.jpg",
  "expiresAt": "2025-01-19T15:00:00Z"
}
```

**Notes:**
- Upload URL valid for 60 seconds
- File path format: `{userId}/{optimizationId}/{timestamp}.jpg`

---

### 4.2 Upload File to Supabase

**PUT {uploadUrl}**

**Headers:**
- `Content-Type`: `image/jpeg` or `image/png` or `image/heic`

**Body:** Binary file data

**Response Success (200 OK):**
```json
{
  "Key": "receipts/user-123/opt-550e8400/1737291600000.jpg"
}
```

---

### 4.3 Confirm Upload

**POST /api/receipts/confirm**

**Request Body:**
```json
{
  "fileId": "user-123/opt-550e8400/1737291600000.jpg",
  "optimizationId": "550e8400-e29b-41d4-a716-446655440000",
  "actualTotal": 1234.56,
  "notes": "Optional user notes"
}
```

**Response Success (201 Created):**
```json
{
  "id": "receipt-uuid",
  "optimizationId": "550e8400-e29b-41d4-a716-446655440000",
  "fileUrl": "https://{project}.supabase.co/storage/v1/object/public/receipts/user-123/opt-550e8400/1737291600000.jpg",
  "actualTotal": 1234.56,
  "uploadedAt": "2025-01-19T14:30:00Z",
  "expiresAt": "2025-04-19T14:30:00Z"
}
```

---

## 5. Database Schema

### Receipt Model

**File:** Update `libs/database/prisma/schema.prisma`

```prisma
model Receipt {
  id              String   @id @default(uuid())
  userId          String
  optimizationId  String

  // Storage
  fileUrl         String   // Public URL to Supabase Storage
  fileId          String   // Storage path
  fileSize        Int?     // Bytes
  mimeType        String?  // image/jpeg, image/png, etc.

  // Metadata
  actualTotal     Decimal
  notes           String?

  // Timestamps
  uploadedAt      DateTime @default(now())
  expiresAt       DateTime // 90 days from uploadedAt
  deletedAt       DateTime? // Soft delete

  // Relations
  user            User     @relation(fields: [userId], references: [id])
  optimization    OptimizationResult @relation(fields: [optimizationId], references: [id])

  @@map("receipts")
  @@index([userId])
  @@index([expiresAt]) // For cleanup queries
}
```

---

## 6. Implementation

### 6.1 Receipts Service

**File:** `apps/backend/src/receipts/receipts.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReceiptsService {
  private supabase = createClient(
    process.env['SUPABASE_URL']!,
    process.env['SUPABASE_SERVICE_KEY']! // Service role key for admin operations
  );

  constructor(private readonly prisma: PrismaService) {}

  async generateUploadUrl(optimizationId: string, userId: string) {
    // Verify optimization exists and belongs to user
    const optimization = await this.prisma.optimizationResult.findUnique({
      where: { id: optimizationId },
    });

    if (!optimization || optimization.userId !== userId) {
      throw new NotFoundException('Optimization result not found');
    }

    // Generate unique file path
    const timestamp = Date.now();
    const fileId = `${userId}/${optimizationId}/${timestamp}.jpg`;

    // Generate pre-signed upload URL (valid for 60 seconds)
    const { data, error } = await this.supabase.storage
      .from('receipts')
      .createSignedUploadUrl(fileId, {
        upsert: false, // Don't allow overwriting
      });

    if (error) {
      throw new Error(`Failed to generate upload URL: ${error.message}`);
    }

    return {
      uploadUrl: data.signedUrl,
      fileId,
      expiresAt: new Date(Date.now() + 60 * 1000), // 60 seconds from now
    };
  }

  async confirmUpload(
    fileId: string,
    optimizationId: string,
    actualTotal: number,
    userId: string,
    notes?: string
  ) {
    // Verify file was uploaded
    const { data: fileData, error: fileError } = await this.supabase.storage
      .from('receipts')
      .list(fileId.split('/').slice(0, -1).join('/'), {
        search: fileId.split('/').pop(),
      });

    if (fileError || !fileData || fileData.length === 0) {
      throw new NotFoundException('File not found in storage');
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from('receipts')
      .getPublicUrl(fileId);

    // Calculate expiry date (90 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    // Store metadata in database
    const receipt = await this.prisma.receipt.create({
      data: {
        userId,
        optimizationId,
        fileUrl: urlData.publicUrl,
        fileId,
        fileSize: fileData[0].metadata?.size,
        mimeType: fileData[0].metadata?.mimetype,
        actualTotal,
        notes,
        expiresAt,
      },
    });

    return receipt;
  }

  async getReceiptsByUser(userId: string) {
    return this.prisma.receipt.findMany({
      where: { userId, deletedAt: null },
      orderBy: { uploadedAt: 'desc' },
      include: {
        optimization: {
          select: {
            id: true,
            recommendedStore: true,
            createdAt: true,
          },
        },
      },
    });
  }
}
```

### 6.2 Receipts Controller

**File:** `apps/backend/src/receipts/receipts.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ReceiptsService } from './receipts.service';

@Controller('receipts')
@UseGuards(AuthGuard('jwt'))
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Get('upload-url')
  async getUploadUrl(
    @Query('optimizationId') optimizationId: string,
    @CurrentUser() user: { id: string }
  ) {
    if (!optimizationId) {
      throw new BadRequestException('optimizationId query parameter required');
    }

    return this.receiptsService.generateUploadUrl(optimizationId, user.id);
  }

  @Post('confirm')
  async confirmUpload(
    @Body() body: {
      fileId: string;
      optimizationId: string;
      actualTotal: number;
      notes?: string;
    },
    @CurrentUser() user: { id: string }
  ) {
    const { fileId, optimizationId, actualTotal, notes } = body;

    return this.receiptsService.confirmUpload(
      fileId,
      optimizationId,
      actualTotal,
      user.id,
      notes
    );
  }

  @Get()
  async getUserReceipts(@CurrentUser() user: { id: string }) {
    return this.receiptsService.getReceiptsByUser(user.id);
  }
}
```

---

## 7. Supabase Storage Configuration

### 7.1 Create Bucket

**Via Supabase Dashboard:**
1. Go to Storage → Buckets
2. Create new bucket: `receipts`
3. Settings:
   - Public: `true` (for public URLs)
   - File Size Limit: `5MB`
   - Allowed MIME types: `image/jpeg,image/png,image/heic`

**Via SQL (alternative):**
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true);
```

### 7.2 Storage Policies (RLS)

**Policy 1: Users can upload their own receipts**
```sql
CREATE POLICY "Users can upload own receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 2: Users can read their own receipts**
```sql
CREATE POLICY "Users can view own receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 3: Service role can delete receipts (for cleanup)**
```sql
CREATE POLICY "Service role can delete receipts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'receipts' AND
  auth.jwt()->>'role' = 'service_role'
);
```

---

## 8. 90-Day Retention Policy

### Option 1: Supabase Storage Lifecycle (Recommended if available)

**Note:** Check if Supabase supports lifecycle policies. If yes:

```json
{
  "bucket": "receipts",
  "rules": [
    {
      "action": "delete",
      "condition": {
        "age_days": 90
      }
    }
  ]
}
```

### Option 2: Cron Job Cleanup (Fallback)

**File:** `apps/backend/src/receipts/cleanup.cron.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class ReceiptCleanupCron {
  private readonly logger = new Logger(ReceiptCleanupCron.name);
  private supabase = createClient(
    process.env['SUPABASE_URL']!,
    process.env['SUPABASE_SERVICE_KEY']!
  );

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredReceipts() {
    this.logger.log('Starting receipt cleanup job');

    // Find expired receipts
    const expired = await this.prisma.receipt.findMany({
      where: {
        expiresAt: { lt: new Date() },
        deletedAt: null,
      },
    });

    this.logger.log(`Found ${expired.length} expired receipts to delete`);

    for (const receipt of expired) {
      try {
        // Delete from Supabase Storage
        const { error } = await this.supabase.storage
          .from('receipts')
          .remove([receipt.fileId]);

        if (error) {
          this.logger.error(
            `Failed to delete file ${receipt.fileId}: ${error.message}`
          );
          continue;
        }

        // Soft delete in database (mark as deleted)
        await this.prisma.receipt.update({
          where: { id: receipt.id },
          data: { deletedAt: new Date() },
        });

        this.logger.log(`Deleted receipt ${receipt.id}`);
      } catch (error) {
        this.logger.error(`Error deleting receipt ${receipt.id}:`, error);
      }
    }

    this.logger.log(
      `Cleanup completed. Deleted ${expired.length} receipts.`
    );
  }
}
```

**Enable Cron:**
```typescript
// apps/backend/src/app.module.ts
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // ... other imports
  ],
})
```

---

## 9. Frontend Integration

### 9.1 Upload Component

**File:** `apps/web/src/components/features/receipts/ReceiptUpload.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

export function ReceiptUpload({ optimizationId }: { optimizationId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [actualTotal, setActualTotal] = useState('')
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/heic'].includes(selectedFile.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a JPG, PNG, or HEIC image',
          variant: 'destructive',
        })
        return
      }

      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please upload a file smaller than 5MB',
          variant: 'destructive',
        })
        return
      }

      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file || !actualTotal) return

    setUploading(true)

    try {
      // Step 1: Get upload URL
      const urlResponse = await fetch(
        `/api/receipts/upload-url?optimizationId=${optimizationId}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      )
      const { uploadUrl, fileId } = await urlResponse.json()

      // Step 2: Upload file directly to Supabase
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      // Step 3: Confirm upload
      await fetch('/api/receipts/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          fileId,
          optimizationId,
          actualTotal: parseFloat(actualTotal),
        }),
      })

      toast({
        title: 'Receipt Uploaded',
        description: 'Thank you! Your receipt has been saved.',
      })

      setFile(null)
      setActualTotal('')
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'Could not upload receipt. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Upload Receipt Photo
        </label>
        <Input
          type="file"
          accept="image/jpeg,image/png,image/heic"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Max 5MB | JPG, PNG, or HEIC
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Actual Total Paid (R)
        </label>
        <Input
          type="number"
          step="0.01"
          placeholder="1234.56"
          value={actualTotal}
          onChange={(e) => setActualTotal(e.target.value)}
          disabled={uploading}
        />
      </div>

      <Button
        onClick={handleUpload}
        disabled={!file || !actualTotal || uploading}
        className="w-full"
      >
        {uploading ? 'Uploading...' : 'Upload Receipt'}
      </Button>
    </div>
  )
}
```

---

## 10. Security Considerations

### 10.1 File Upload Security

- ✅ **File Type Validation:** Only accept image/* MIME types
- ✅ **File Size Limit:** 5MB maximum
- ✅ **Signed URLs:** 60-second expiry prevents abuse
- ✅ **User Isolation:** File path includes userId (prevents cross-user access)
- ✅ **Authentication Required:** JWT token validated

### 10.2 Storage Access Control

- ✅ **Row-Level Security:** Supabase RLS policies enforce user ownership
- ✅ **Public URLs:** Files are public but paths are non-guessable (UUID-based)
- ✅ **Soft Delete:** Receipts marked as deleted but not immediately removed (audit trail)

### 10.3 Privacy

- ✅ **90-Day Retention:** Automatic cleanup after 90 days (PRD requirement §7.2)
- ✅ **User Deletion:** When user deletes account, cascade delete receipts
- ✅ **No OCR (MVP):** Receipt images not processed automatically (PRD §5.2)

---

## 11. Monitoring & Logging

### Metrics to Track

- Receipt upload success rate
- Average file size
- Storage usage (GB)
- Upload failures by error type
- Cleanup job success rate

### Logs

```typescript
this.logger.log(`Receipt upload initiated for optimization ${optimizationId}`);
this.logger.log(`Receipt uploaded successfully: ${receipt.id}, size: ${fileSize} bytes`);
this.logger.error(`Receipt upload failed: ${error.message}`);
this.logger.log(`Cleanup deleted ${count} expired receipts`);
```

---

## 12. Success Criteria

- ✅ Users can upload receipt photos (JPG/PNG/HEIC, max 5MB)
- ✅ Receipts stored in Supabase Storage with public URLs
- ✅ Receipt metadata stored in database (actualTotal, timestamps)
- ✅ 90-day retention policy enforced (auto-delete old receipts)
- ✅ Upload workflow completes in <5 seconds
- ✅ Cleanup cron runs daily and logs results
- ✅ Unit tests for service methods
- ✅ E2E test for upload → confirm → retrieve flow

---

## 13. Future Enhancements (Post-MVP)

1. **OCR Processing (Phase 1.5/2):**
   - Extract line items from receipt image
   - Match to shopping list items
   - Automatically populate actualTotal

2. **Image Compression:**
   - Compress large images before upload
   - Reduce storage costs

3. **Thumbnails:**
   - Generate thumbnails for gallery view
   - Faster loading in receipts list

4. **Manual Data Entry:**
   - UI to manually enter line items from receipt
   - Match to optimization results

---

## 14. Related Documentation

- **PRD:** `docs/prd.md` §7.1.6 (Feedback Loop), §7.2 (90-day retention)
- **Optimization API:** `docs/architecture/frontend-architecture.md` (RTK Query receiptsApi)
- **Security:** `docs/architecture.md` §7 (Privacy section)
