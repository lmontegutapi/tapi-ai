'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { getContactReceivablesPaginated } from "@/actions/contacts";

export function ContactReceivablesPagination({ 
  contactId 
}: { 
  contactId: string 
}) {
  const [page, setPage] = useState(1);
  const [receivables, setReceivables] = useState([]);
  const [pagination, setPagination] = useState(null);

  const loadReceivables = async (newPage: number) => {
    const result = await getContactReceivablesPaginated(contactId, newPage);
    if (result) {
      setReceivables(result.receivables);
      setPagination(result.pagination);
      setPage(newPage);
    }
  };

  return (
    <div>
      {/* Tabla de deudas paginadas */}
      <div className="flex justify-between items-center mt-4">
        <Button 
          onClick={() => loadReceivables(page - 1)}
          disabled={page === 1}
        >
          Anterior
        </Button>
        <span>
          Página {page} de {pagination?.totalPages}
        </span>
        <Button 
          onClick={() => loadReceivables(page + 1)}
          disabled={page === pagination?.totalPages}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}