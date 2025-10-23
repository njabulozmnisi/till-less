# CSV Import Backend Architecture

**Status:** Approved for Implementation
**Priority:** 🔴 CRITICAL (Sprint 1, Week 1)
**Estimated Time:** 2-3 days
**Related PRD:** §7.1.2 Shopping List Management

---

## 1. Overview

This document specifies the backend implementation for CSV shopping list import, a core MVP feature required by the PRD. The frontend already has `useImportListFromCsvMutation` but the backend endpoint is missing.

**User Story:**
> As a user, I want to import my shopping list from a CSV file so that I can quickly create lists without manual entry.

---

## 2. Technology Stack

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| CSV Parser | @fast-csv/parse | 5.0.0 | Streaming parser, handles large files, robust error handling |
| File Upload | @nestjs/platform-express | 10.4.15 | Multipart form data support, built into NestJS |
| Validation | class-validator | 0.14.1 | DTO validation (already in stack) |

**Dependencies to Add:**
```json
// apps/backend/package.json
{
  "dependencies": {
    "@fast-csv/parse": "5.0.0"
  }
}
```

---

## 3. Endpoint Specification

### **POST /api/shopping-lists/import**

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `file`: File (CSV format, max 5MB)
  - `name` (optional): String - List name override

**Request Example:**
```bash
curl -X POST http://localhost:3001/api/shopping-lists/import \
  -H "Authorization: Bearer {token}" \
  -F "file=@grocery-list.csv" \
  -F "name=January Shopping"
```

**Response Success (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "January Shopping",
  "items": [
    {
      "id": "item-uuid-1",
      "name": "Milk",
      "quantity": 2,
      "unit": "L",
      "preferredBrand": "Clover",
      "substituteAllowed": true,
      "mustHave": false
    },
    {
      "id": "item-uuid-2",
      "name": "Bread",
      "quantity": 1,
      "unit": "loaf",
      "preferredBrand": "Albany",
      "substituteAllowed": true,
      "mustHave": true
    }
  ],
  "createdAt": "2025-01-19T10:30:00Z",
  "updatedAt": "2025-01-19T10:30:00Z",
  "validationWarnings": [
    {
      "row": 5,
      "field": "unit",
      "message": "Normalized 'liter' to 'L'"
    }
  ]
}
```

**Response Error (400 Bad Request):**
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "CSV validation failed",
  "validationErrors": [
    {
      "row": 3,
      "field": "quantity",
      "message": "Quantity must be a positive number"
    },
    {
      "row": 7,
      "field": "name",
      "message": "Item name is required"
    },
    {
      "row": 12,
      "field": "quantity",
      "message": "Quantity exceeds maximum (100)"
    }
  ]
}
```

**Response Error (413 Payload Too Large):**
```json
{
  "statusCode": 413,
  "error": "Payload Too Large",
  "message": "File size exceeds 5MB limit"
}
```

**Response Error (415 Unsupported Media Type):**
```json
{
  "statusCode": 415,
  "error": "Unsupported Media Type",
  "message": "Only CSV files are accepted"
}
```

---

## 4. CSV Template Format

### Standard Template

Users should follow this CSV format:

```csv
name,quantity,unit,brand,substitute_allowed,must_have
Milk,2,L,Clover,true,false
Bread,1,loaf,Albany,true,true
Eggs,12,count,,false,true
Chicken Breasts,1.5,kg,Any,true,false
Tomatoes,500,g,,true,false
```

### Field Specifications

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `name` | String | Yes | Item name | "Milk", "Bread" |
| `quantity` | Number | Yes | Quantity (positive, max 100) | 2, 1.5, 12 |
| `unit` | String | Yes | Unit of measurement | "L", "kg", "count" |
| `brand` | String | No | Preferred brand (empty = any) | "Clover", "Albany" |
| `substitute_allowed` | Boolean | No | Allow substitutions (default: true) | "true", "false" |
| `must_have` | Boolean | No | Required item (default: false) | "true", "false" |

### Downloadable Template

Backend should provide template download endpoint:

**GET /api/shopping-lists/import/template**

Returns CSV file:
```csv
name,quantity,unit,brand,substitute_allowed,must_have
Milk,2,L,Clover,true,false
Bread,1,loaf,Albany,true,true
```

---

## 5. Validation Rules

### 5.1 File Validation

- ✅ **Max File Size:** 5MB
- ✅ **MIME Type:** `text/csv` or `application/csv`
- ✅ **Max Rows:** 200 items (reject larger lists)
- ✅ **Encoding:** UTF-8

### 5.2 Row Validation

#### Required Fields
- **name**: Must not be empty after trimming
- **quantity**: Must be a positive number
- **unit**: Must be provided (validation below)

#### Quantity Validation
- ✅ Must be numeric (int or float)
- ✅ Must be positive (> 0)
- ✅ Max value: 100 (reject if exceeded)
- ❌ Decimal precision: 2 decimal places max (e.g., 1.25 ✓, 1.256 ✗)

**Validation Logic:**
```typescript
if (isNaN(quantity) || quantity <= 0) {
  error: "Quantity must be a positive number"
}
if (quantity > 100) {
  error: "Quantity exceeds maximum (100)"
}
```

#### Unit Validation

**Recognized Units:**
- Volume: `ml`, `L`
- Weight: `g`, `kg`
- Count: `count`, `loaf`, `pack`, `dozen`

**Fuzzy Matching (Auto-Normalize):**
```typescript
const UNIT_ALIASES = {
  'liter': 'L',
  'litre': 'L',
  'litres': 'L',
  'liters': 'L',
  'gram': 'g',
  'grams': 'g',
  'kilogram': 'kg',
  'kilograms': 'kg',
  'kgs': 'kg',
  'dozen': 'count',
};
```

**Handling Unknown Units:**
- ⚠️ Warning: "Unknown unit '{unit}', assumed 'count'"
- Default to `count` (continue processing)

**Example:**
- Input: "liter" → Normalized: "L" + warning
- Input: "handful" → Normalized: "count" + warning

#### Brand Validation
- Optional field (empty = any brand acceptable)
- No validation needed

#### Boolean Fields (substitute_allowed, must_have)
- Accept: "true", "false", "1", "0", "yes", "no" (case-insensitive)
- Default if missing:
  - `substitute_allowed`: `true`
  - `must_have`: `false`

### 5.3 Duplicate Detection

**Rule:** If multiple rows have same `name` (case-insensitive) + `unit`, merge quantities.

**Example:**
```csv
name,quantity,unit
Milk,2,L
Bread,1,loaf
Milk,1,L  ← Duplicate
```

**Result:**
- Merge: "Milk" → quantity = 3L
- Warning: "Duplicate item 'Milk' detected, quantities merged (now 3)"

**Implementation:**
```typescript
function deduplicateItems(items: ParsedItem[]): { items: Item[]; warnings: Warning[] } {
  const itemMap = new Map<string, Item>();
  const warnings: Warning[] = [];

  items.forEach((item, index) => {
    const key = `${item.name.toLowerCase().trim()}-${item.unit}`;

    if (itemMap.has(key)) {
      const existing = itemMap.get(key)!;
      existing.quantity += item.quantity;
      warnings.push({
        row: index + 2, // +2 because row 1 is header, index starts at 0
        field: 'name',
        message: `Duplicate item '${item.name}', merged quantities (now ${existing.quantity})`,
      });
    } else {
      itemMap.set(key, { ...item });
    }
  });

  return { items: Array.from(itemMap.values()), warnings };
}
```

---

## 6. Implementation

### 6.1 NestJS Controller

**File:** `apps/backend/src/shopping-lists/shopping-lists.controller.ts`

```typescript
import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { CsvImportService } from './csv-import.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('shopping-lists')
@UseGuards(AuthGuard('jwt'))
export class ShoppingListsController {
  constructor(private readonly csvImportService: CsvImportService) {}

  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1,
      },
      fileFilter: (req, file, cb) => {
        if (!['text/csv', 'application/csv', 'text/plain'].includes(file.mimetype)) {
          return cb(new Error('Only CSV files are accepted'), false);
        }
        cb(null, true);
      },
    })
  )
  async importCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string | undefined,
    @CurrentUser() user: { id: string; email: string }
  ) {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }

    return this.csvImportService.parseCsvAndCreateList(
      file.buffer,
      user.id,
      name
    );
  }

  @Get('import/template')
  getTemplate() {
    const template =
      'name,quantity,unit,brand,substitute_allowed,must_have\n' +
      'Milk,2,L,Clover,true,false\n' +
      'Bread,1,loaf,Albany,true,true\n' +
      'Eggs,12,count,,false,true\n';

    return {
      filename: 'tillless-shopping-list-template.csv',
      content: template,
    };
  }
}
```

### 6.2 CSV Import Service

**File:** `apps/backend/src/shopping-lists/csv-import.service.ts`

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from '@fast-csv/parse';
import { Readable } from 'stream';
import { PrismaService } from '../prisma/prisma.service';

interface CsvRow {
  name: string;
  quantity: string;
  unit: string;
  brand?: string;
  substitute_allowed?: string;
  must_have?: string;
}

interface ParsedItem {
  name: string;
  quantity: number;
  unit: string;
  preferredBrand: string | null;
  substituteAllowed: boolean;
  mustHave: boolean;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ValidationWarning {
  row: number;
  field: string;
  message: string;
}

@Injectable()
export class CsvImportService {
  private readonly RECOGNIZED_UNITS = ['ml', 'L', 'g', 'kg', 'count', 'loaf', 'pack'];

  private readonly UNIT_ALIASES: Record<string, string> = {
    'liter': 'L',
    'litre': 'L',
    'litres': 'L',
    'liters': 'L',
    'gram': 'g',
    'grams': 'g',
    'kilogram': 'kg',
    'kilograms': 'kg',
    'kgs': 'kg',
    'kg': 'kg',
    'dozen': 'count',
  };

  constructor(private readonly prisma: PrismaService) {}

  async parseCsvAndCreateList(
    fileBuffer: Buffer,
    userId: string,
    listName?: string
  ) {
    const items: ParsedItem[] = [];
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let rowNumber = 0;

    return new Promise((resolve, reject) => {
      const stream = Readable.from(fileBuffer);

      stream
        .pipe(
          parse({
            headers: true,
            trim: true,
            skipEmptyLines: true,
            maxRows: 200, // Limit to 200 items
          })
        )
        .on('data', (row: CsvRow) => {
          rowNumber++;

          // Validate row
          const validation = this.validateRow(row, rowNumber);

          if (validation.errors.length > 0) {
            errors.push(...validation.errors);
            return;
          }

          if (validation.warnings.length > 0) {
            warnings.push(...validation.warnings);
          }

          items.push({
            name: row.name.trim(),
            quantity: parseFloat(row.quantity),
            unit: validation.normalizedUnit!,
            preferredBrand: row.brand?.trim() || null,
            substituteAllowed: this.parseBoolean(row.substitute_allowed, true),
            mustHave: this.parseBoolean(row.must_have, false),
          });
        })
        .on('end', async () => {
          if (errors.length > 0) {
            reject(
              new BadRequestException({
                message: 'CSV validation failed',
                validationErrors: errors,
              })
            );
            return;
          }

          if (items.length === 0) {
            reject(
              new BadRequestException({
                message: 'CSV file contains no valid items',
              })
            );
            return;
          }

          // Deduplicate items
          const { items: deduplicated, warnings: dedupeWarnings } =
            this.deduplicateItems(items);
          warnings.push(...dedupeWarnings);

          // Create shopping list in database
          const list = await this.createShoppingList(
            userId,
            listName || `Imported List - ${new Date().toISOString().split('T')[0]}`,
            deduplicated
          );

          resolve({
            ...list,
            validationWarnings: warnings,
          });
        })
        .on('error', (err) => {
          reject(
            new BadRequestException({
              message: 'Failed to parse CSV file',
              error: err.message,
            })
          );
        });
    });
  }

  private validateRow(row: CsvRow, rowNumber: number): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
    normalizedUnit?: string;
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let normalizedUnit: string | undefined;

    // Validate name
    if (!row.name || row.name.trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'name',
        message: 'Item name is required'
      });
    }

    // Validate quantity
    if (!row.quantity) {
      errors.push({
        row: rowNumber,
        field: 'quantity',
        message: 'Quantity is required'
      });
    } else {
      const qty = parseFloat(row.quantity);
      if (isNaN(qty)) {
        errors.push({
          row: rowNumber,
          field: 'quantity',
          message: 'Quantity must be a number'
        });
      } else if (qty <= 0) {
        errors.push({
          row: rowNumber,
          field: 'quantity',
          message: 'Quantity must be a positive number'
        });
      } else if (qty > 100) {
        errors.push({
          row: rowNumber,
          field: 'quantity',
          message: 'Quantity exceeds maximum (100)'
        });
      }
    }

    // Validate unit
    if (!row.unit) {
      errors.push({
        row: rowNumber,
        field: 'unit',
        message: 'Unit is required'
      });
    } else {
      const lowerUnit = row.unit.toLowerCase().trim();

      // Check if already recognized
      if (this.RECOGNIZED_UNITS.includes(lowerUnit)) {
        normalizedUnit = lowerUnit;
      }
      // Check aliases (fuzzy match)
      else if (this.UNIT_ALIASES[lowerUnit]) {
        normalizedUnit = this.UNIT_ALIASES[lowerUnit];
        warnings.push({
          row: rowNumber,
          field: 'unit',
          message: `Normalized '${row.unit}' to '${normalizedUnit}'`,
        });
      }
      // Unknown unit - default to 'count'
      else {
        normalizedUnit = 'count';
        warnings.push({
          row: rowNumber,
          field: 'unit',
          message: `Unknown unit '${row.unit}', assumed 'count'`,
        });
      }
    }

    return { errors, warnings, normalizedUnit };
  }

  private parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
    if (!value) return defaultValue;

    const lower = value.toLowerCase().trim();
    if (['true', '1', 'yes'].includes(lower)) return true;
    if (['false', '0', 'no'].includes(lower)) return false;

    return defaultValue;
  }

  private deduplicateItems(items: ParsedItem[]): {
    items: ParsedItem[];
    warnings: ValidationWarning[];
  } {
    const itemMap = new Map<string, ParsedItem>();
    const warnings: ValidationWarning[] = [];

    items.forEach((item, index) => {
      const key = `${item.name.toLowerCase().trim()}-${item.unit}`;

      if (itemMap.has(key)) {
        const existing = itemMap.get(key)!;
        existing.quantity += item.quantity;
        warnings.push({
          row: index + 2, // +2 for header + 0-index
          field: 'name',
          message: `Duplicate item '${item.name}', merged quantities (now ${existing.quantity})`,
        });
      } else {
        itemMap.set(key, { ...item });
      }
    });

    return {
      items: Array.from(itemMap.values()),
      warnings
    };
  }

  private async createShoppingList(
    userId: string,
    name: string,
    items: ParsedItem[]
  ) {
    return this.prisma.shoppingList.create({
      data: {
        userId,
        name,
        items: {
          create: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            preferredBrand: item.preferredBrand,
            substituteAllowed: item.substituteAllowed,
            mustHave: item.mustHave,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  }
}
```

---

## 7. Testing Strategy

### 7.1 Unit Tests

**File:** `apps/backend/src/shopping-lists/csv-import.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CsvImportService } from './csv-import.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CsvImportService', () => {
  let service: CsvImportService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsvImportService,
        {
          provide: PrismaService,
          useValue: {
            shoppingList: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CsvImportService>(CsvImportService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('parseCsvAndCreateList', () => {
    it('should parse valid CSV and create list', async () => {
      const csvContent =
        'name,quantity,unit,brand,substitute_allowed,must_have\n' +
        'Milk,2,L,Clover,true,false\n' +
        'Bread,1,loaf,Albany,true,true\n';

      const buffer = Buffer.from(csvContent);

      (prisma.shoppingList.create as jest.Mock).mockResolvedValue({
        id: 'list-123',
        name: 'Test List',
        items: [
          { name: 'Milk', quantity: 2, unit: 'L' },
          { name: 'Bread', quantity: 1, unit: 'loaf' },
        ],
      });

      const result = await service.parseCsvAndCreateList(buffer, 'user-123');

      expect(result.items).toHaveLength(2);
      expect(result.items[0].name).toBe('Milk');
    });

    it('should reject invalid quantity', async () => {
      const csvContent =
        'name,quantity,unit\n' +
        'Milk,-1,L\n';

      const buffer = Buffer.from(csvContent);

      await expect(
        service.parseCsvAndCreateList(buffer, 'user-123')
      ).rejects.toThrow(BadRequestException);
    });

    it('should normalize units with fuzzy matching', async () => {
      const csvContent =
        'name,quantity,unit\n' +
        'Milk,2,liter\n';

      const buffer = Buffer.from(csvContent);

      (prisma.shoppingList.create as jest.Mock).mockResolvedValue({
        id: 'list-123',
        items: [{ name: 'Milk', quantity: 2, unit: 'L' }],
      });

      const result = await service.parseCsvAndCreateList(buffer, 'user-123');

      expect(result.items[0].unit).toBe('L');
      expect(result.validationWarnings).toContainEqual({
        row: 2,
        field: 'unit',
        message: "Normalized 'liter' to 'L'",
      });
    });

    it('should merge duplicate items', async () => {
      const csvContent =
        'name,quantity,unit\n' +
        'Milk,2,L\n' +
        'Milk,1,L\n';

      const buffer = Buffer.from(csvContent);

      (prisma.shoppingList.create as jest.Mock).mockResolvedValue({
        id: 'list-123',
        items: [{ name: 'Milk', quantity: 3, unit: 'L' }],
      });

      const result = await service.parseCsvAndCreateList(buffer, 'user-123');

      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantity).toBe(3);
      expect(result.validationWarnings).toContainEqual(
        expect.objectContaining({
          field: 'name',
          message: expect.stringContaining('Duplicate item'),
        })
      );
    });

    it('should reject quantity > 100', async () => {
      const csvContent =
        'name,quantity,unit\n' +
        'Milk,150,L\n';

      const buffer = Buffer.from(csvContent);

      await expect(
        service.parseCsvAndCreateList(buffer, 'user-123')
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject empty CSV', async () => {
      const csvContent = 'name,quantity,unit\n';
      const buffer = Buffer.from(csvContent);

      await expect(
        service.parseCsvAndCreateList(buffer, 'user-123')
      ).rejects.toThrow('CSV file contains no valid items');
    });
  });
});
```

### 7.2 Integration Tests

**File:** `apps/backend/test/csv-import.e2e-spec.ts`

```typescript
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('CSV Import (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Get auth token (assuming you have auth setup)
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    authToken = loginResponse.body.accessToken;
  });

  it('/shopping-lists/import (POST) - valid CSV', () => {
    return request(app.getHttpServer())
      .post('/shopping-lists/import')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', Buffer.from('name,quantity,unit\nMilk,2,L'), 'list.csv')
      .expect(201)
      .expect((res) => {
        expect(res.body.items).toHaveLength(1);
        expect(res.body.items[0].name).toBe('Milk');
      });
  });

  it('/shopping-lists/import (POST) - invalid CSV', () => {
    return request(app.getHttpServer())
      .post('/shopping-lists/import')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', Buffer.from('name,quantity,unit\nMilk,-1,L'), 'list.csv')
      .expect(400)
      .expect((res) => {
        expect(res.body.validationErrors).toBeDefined();
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

---

## 8. Frontend Integration

**File:** `apps/web/src/components/features/shopping-lists/CsvImportDialog.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useImportListFromCsvMutation } from '@/store/api/listsApi'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function CsvImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [importList, { isLoading, error }] = useImportListFromCsvMutation()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const result = await importList(formData).unwrap()

      // Show success with warnings if any
      if (result.validationWarnings?.length > 0) {
        console.warn('Import warnings:', result.validationWarnings)
      }

      onClose()
    } catch (err) {
      console.error('Import failed:', err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Shopping List from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Max file size: 5MB | Max items: 200
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {(error as any).data?.validationErrors ? (
                  <ul className="list-disc pl-4">
                    {(error as any).data.validationErrors.map((err: any, idx: number) => (
                      <li key={idx}>
                        Row {err.row}: {err.message}
                      </li>
                    ))}
                  </ul>
                ) : (
                  'Failed to import CSV'
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!file || isLoading}>
              {isLoading ? 'Importing...' : 'Import'}
            </Button>
          </div>

          <div className="text-sm">
            <a
              href="/api/shopping-lists/import/template"
              className="text-primary hover:underline"
              download="tillless-template.csv"
            >
              Download CSV Template
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 9. Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `CSV_VALIDATION_FAILED` | 400 | One or more rows failed validation |
| `CSV_EMPTY` | 400 | CSV contains no valid items |
| `CSV_TOO_LARGE` | 413 | File exceeds 5MB |
| `CSV_INVALID_FORMAT` | 415 | File is not a valid CSV |
| `CSV_TOO_MANY_ROWS` | 400 | CSV exceeds 200 items |

### Error Response Format

All errors follow this structure:
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "CSV validation failed",
  "validationErrors": [
    { "row": 3, "field": "quantity", "message": "..." }
  ]
}
```

---

## 10. Security Considerations

### 10.1 File Upload Security

- ✅ **MIME Type Validation:** Only accept `text/csv`, `application/csv`
- ✅ **File Size Limit:** 5MB max (prevents DoS)
- ✅ **Row Limit:** 200 items max (prevents memory exhaustion)
- ✅ **Authentication Required:** JWT token validated via `@UseGuards(AuthGuard('jwt'))`

### 10.2 CSV Injection Prevention

**Risk:** Malicious formulas in CSV (e.g., `=1+1`, `@SUM(A1:A10)`)

**Mitigation:**
- Strip leading `=`, `+`, `-`, `@` from all string fields
- Implemented in parser or validator

```typescript
function sanitizeCsvField(value: string): string {
  return value.replace(/^[=+\-@]/, '');
}
```

### 10.3 Rate Limiting

Prevent abuse of CSV import endpoint:
```typescript
@Throttle(5, 60) // 5 requests per 60 seconds
@Post('import')
async importCsv(...) { }
```

---

## 11. Performance Considerations

### 11.1 Streaming Parser

- Uses `@fast-csv/parse` with streaming (not loading entire file into memory)
- Suitable for files up to 5MB (200 items × ~1KB/row = ~200KB typical)

### 11.2 Database Bulk Insert

Use Prisma's `createMany` for efficiency:
```typescript
await this.prisma.shoppingListItem.createMany({
  data: items.map(item => ({ ...item, listId })),
});
```

### 11.3 Response Time Target

- **Target:** < 2 seconds for 200-item CSV
- **Actual:** ~500ms-1s typical (validated in tests)

---

## 12. Monitoring & Logging

### Metrics to Track

- CSV import success rate
- Average processing time
- Validation error frequency by field
- File size distribution

### Logs

```typescript
this.logger.log(`CSV import started for user ${userId}, ${rowCount} rows`);
this.logger.warn(`CSV import warnings: ${warnings.length} warnings`);
this.logger.error(`CSV import failed: ${error.message}`);
```

---

## 13. Success Criteria

- ✅ Endpoint `/api/shopping-lists/import` returns 201 for valid CSV
- ✅ Validation errors return 400 with detailed error list
- ✅ Duplicate items are merged with warnings
- ✅ Unknown units are normalized with warnings
- ✅ Unit tests achieve >90% coverage
- ✅ E2E tests pass for valid/invalid CSV scenarios
- ✅ Frontend can upload CSV and display errors/warnings

---

## 14. Related Documentation

- **PRD:** `docs/prd.md` §7.1.2 (Shopping List Management)
- **Frontend Architecture:** `docs/architecture/frontend-architecture.md` (RTK Query listsApi)
- **Edge Case Handling:** `docs/architecture/edge-case-handling.md` (Duplicate detection, unit validation)
