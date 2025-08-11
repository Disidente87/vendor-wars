import { PaymentSystemTester } from '@/components/vendor-registration/PaymentSystemTester'

export const metadata = {
  title: 'Test del Sistema de Pagos - Vendor Wars',
  description: 'Prueba todas las funcionalidades del sistema de pagos para registro de vendors',
}

export default function TestPaymentSystemPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <PaymentSystemTester />
    </div>
  )
}
