export const PaymentHeader = ({ organization }: { organization: any }) => {
  return (
    <div className="bg-slate-900 text-white py-8 border-b">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <span className="text-xl font-bold">
              {organization?.name?.[0] || 'P'}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">¡Hola!</h1>
            <p className="text-slate-300">
              Aquí podrás ver tus cuentas por pagar a {organization?.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};