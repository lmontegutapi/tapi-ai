-- Crear tablas de relación si no existen
CREATE TABLE IF NOT EXISTS "_audience_to_contact" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT audience_contact_fkey FOREIGN KEY ("A") REFERENCES "audience"("id") ON DELETE CASCADE,
    CONSTRAINT contact_audience_fkey FOREIGN KEY ("B") REFERENCES "contact"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "_audience_to_receivable" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT audience_receivable_fkey FOREIGN KEY ("A") REFERENCES "audience"("id") ON DELETE CASCADE,
    CONSTRAINT receivable_audience_fkey FOREIGN KEY ("B") REFERENCES "receivable"("id") ON DELETE CASCADE
);

-- Índices
CREATE UNIQUE INDEX IF NOT EXISTS "_audience_to_contact_AB_unique" ON "_audience_to_contact"("A", "B");
CREATE INDEX IF NOT EXISTS "_audience_to_contact_B_index" ON "_audience_to_contact"("B");

CREATE UNIQUE INDEX IF NOT EXISTS "_audience_to_receivable_AB_unique" ON "_audience_to_receivable"("A", "B");
CREATE INDEX IF NOT EXISTS "_audience_to_receivable_B_index" ON "_audience_to_receivable"("B");