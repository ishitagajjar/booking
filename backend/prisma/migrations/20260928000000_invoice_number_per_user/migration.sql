-- Invoice numbers are generated per user, so uniqueness must be per user too.
-- DropIndex
DROP INDEX "invoices_invoice_number_key";

-- CreateIndex
CREATE UNIQUE INDEX "invoices_user_id_invoice_number_key" ON "invoices"("user_id", "invoice_number");
