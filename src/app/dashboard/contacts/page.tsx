import { Suspense } from "react"
import { ContactsTable } from "@/components/contacts/contacts-table"
import { columns } from "@/components/contacts/columns"
import { Skeleton } from "@/components/ui/skeleton"
import { getContacts } from "@/actions/contacts"

export const metadata = {
 title: "Clientes",
 description: "Gestiona tus clientes y sus cobros",
}

export default async function ContactsPage() {
  const contactsData = await getContacts();
  const contacts = contactsData.map(contact => ({
    ...contact,
    phones: contact.contactPhone
  })) as any[];



  console.log("contacts", contacts)
  console.log("contacts phones", contacts[0].contactPhone)
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
          <ContactsTable columns={columns} data={contacts} />
        )}
      </div>
    </div>
  );
}
