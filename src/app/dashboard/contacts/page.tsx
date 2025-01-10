import { Suspense } from "react"
import { ContactsTable } from "@/components/contacts/contacts-table"
import { columns } from "@/components/contacts/columns"
import { Skeleton } from "@/components/ui/skeleton"
import { getContacts } from "@/actions/contacts"
import { TableSkeleton } from "@/components/table-skeleton"
import { Contact, ContactPhone } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"

export const dynamic = 'force-dynamic';
interface ContactWithPhones extends Omit<Contact, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
  phones: Array<Omit<ContactPhone, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
  }>;
}

export const metadata = {
  title: "Clientes",
  description: "Gestiona tus clientes y sus cobros",
}

export default async function ContactsPage() {
  const contactsData = await getContacts();
  
  const contacts = contactsData.map(contact => ({
    ...contact,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
    phones: contact.phones.map(phone => ({
      ...phone,
      createdAt: phone.createdAt.toISOString(),
      updatedAt: phone.updatedAt.toISOString()
    }))
  })) as ContactWithPhones[];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Clientes</h1>
        {contacts.length === 0 ? (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <p className="text-muted-foreground">
              Para agregar clientes, primero debes cargar deudas desde la sección de Deudas o crear una deuda manual.
            </p>
          </div>
        ) : (
          <Suspense fallback={<TableSkeleton columnCount={7} rowCount={5} />}>
            <ContactsTable columns={columns as ColumnDef<ContactWithPhones, any>[]} data={contacts} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
