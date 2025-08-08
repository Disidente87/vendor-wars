'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Download, History, Settings, Copy, ExternalLink, CheckCircle } from 'lucide-react'
import { useWalletConnection } from '@/components/WalletConnect'

interface WalletActionsProps {
  address?: string
  isBaseSepoliaNetwork: boolean
}

export function WalletActions({ address, isBaseSepoliaNetwork }: WalletActionsProps) {
  const [copied, setCopied] = useState(false)
  const [showModal, setShowModal] = useState<string | null>(null)

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOpenExplorer = () => {
    if (address) {
      const explorerUrl = isBaseSepoliaNetwork 
        ? `https://sepolia.basescan.org/address/${address}`
        : `https://etherscan.io/address/${address}`
      window.open(explorerUrl, '_blank')
    }
  }

  const actions = [
    {
      id: 'send',
      icon: <Send className="w-4 h-4" />,
      label: 'Send',
      onClick: () => setShowModal('send'),
      description: 'Send ETH or tokens to another address'
    },
    {
      id: 'receive',
      icon: <Download className="w-4 h-4" />,
      label: 'Receive',
      onClick: handleCopyAddress,
      description: 'Copy your address to receive funds'
    },
    {
      id: 'history',
      icon: <History className="w-4 h-4" />,
      label: 'History',
      onClick: handleOpenExplorer,
      description: 'View transaction history on explorer'
    },
    {
      id: 'settings',
      icon: <Settings className="w-4 h-4" />,
      label: 'Settings',
      onClick: () => setShowModal('settings'),
      description: 'Wallet preferences and security'
    }
  ]

  return (
    <div className="space-y-4">
      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            className="h-12 flex flex-col items-center justify-center space-y-1 hover:bg-gray-50"
            onClick={action.onClick}
          >
            {action.id === 'receive' && copied ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              action.icon
            )}
            <span className="text-xs">
              {action.id === 'receive' && copied ? 'Copied!' : action.label}
            </span>
          </Button>
        ))}
      </div>

      {/* Send Modal */}
      {showModal === 'send' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Send Transaction</h3>
            <p className="text-sm text-gray-600 mb-4">
              This feature is coming soon! You&apos;ll be able to send ETH and tokens directly from your wallet.
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowModal(null)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowModal(null)
                  alert('Send functionality will be implemented with smart contract integration!')
                }}
                className="flex-1"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showModal === 'settings' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Wallet Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Network</span>
                <span className="text-sm font-medium">
                  {isBaseSepoliaNetwork ? 'Base Sepolia' : 'Other'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">Address</span>
                <span className="text-sm font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 mb-4">
              Advanced settings coming soon! This will include network preferences, security settings, and more.
            </p>
            <Button
              onClick={() => setShowModal(null)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
