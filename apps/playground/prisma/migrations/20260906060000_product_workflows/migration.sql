ALTER TABLE "Product"
 ADD COLUMN "sku" TEXT,
 ADD COLUMN "brand" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "unit" TEXT NOT NULL DEFAULT 'piece',
 ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
 ADD COLUMN "gallery" JSONB NOT NULL DEFAULT '[]',
 ADD COLUMN "specifications" JSONB NOT NULL DEFAULT '[]',
 ADD COLUMN "seoTitle" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "seoDescription" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1,
 ADD COLUMN "archivedAt" TIMESTAMP(3),
 ADD COLUMN "parentId" UUID,
 ADD COLUMN "optionLabel" TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE INDEX "Product_parentId_idx" ON "Product"("parentId");
ALTER TABLE "Product" ADD CONSTRAINT "Product_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE TABLE "InventoryMovement" (
 "id" UUID NOT NULL, "productId" UUID NOT NULL, "delta" INTEGER NOT NULL, "balance" INTEGER NOT NULL,
 "reason" TEXT NOT NULL, "actorId" TEXT, "reference" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id"),
 CONSTRAINT "InventoryMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "InventoryMovement_productId_createdAt_idx" ON "InventoryMovement"("productId", "createdAt");
CREATE TABLE "AuditEvent" (
 "id" UUID NOT NULL, "entityType" TEXT NOT NULL, "entityId" TEXT NOT NULL, "action" TEXT NOT NULL,
 "actorId" TEXT, "summary" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditEvent_entityType_entityId_createdAt_idx" ON "AuditEvent"("entityType","entityId","createdAt");
ALTER TABLE "Order" ADD COLUMN "carrier" TEXT NOT NULL DEFAULT '', ADD COLUMN "trackingNumber" TEXT NOT NULL DEFAULT '',
 ADD COLUMN "fulfilledAt" TIMESTAMP(3), ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
