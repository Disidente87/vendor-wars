import { VendorVoteFrame, BattleResultFrame } from '@/components/farcaster-frame'

export default function FramePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Farcaster Frames - Vendor Wars
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Frame de Voto */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Vote Frame Example
            </h2>
            <VendorVoteFrame 
              vendorName="Pupusas Doña María" 
              zoneName="Zona Centro" 
            />
          </div>
          
          {/* Frame de Resultado de Batalla */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Battle Result Frame Example
            </h2>
            <BattleResultFrame 
              winner="Tacos El Güero" 
              loser="Pupusas Doña María" 
              zoneName="Zona Norte" 
            />
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Frame Integration Details
          </h2>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              These Frames demonstrate how Vendor Wars integrates with Farcaster to create engaging social experiences:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Vote Frame:</strong> Allows users to vote for vendors directly from Farcaster</li>
              <li><strong>Battle Result Frame:</strong> Shows battle outcomes and encourages engagement</li>
              <li><strong>Social Sharing:</strong> Frames automatically post to user&apos;s Farcaster feed</li>
              <li><strong>Token Rewards:</strong> Users earn $BATTLE tokens for participating</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 