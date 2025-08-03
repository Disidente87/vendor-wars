'use client'
import { Suspense, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useMiniApp } from '@neynar/react'

export default function HomePage() {
  const router = useRouter()
  const { isSDKLoaded, context } = useMiniApp();

  useEffect(() => {
    const load = async () => {
      if (isSDKLoaded) {
        try {
          const { sdk } = await import('@farcaster/miniapp-sdk');
          await sdk.actions.ready();
          console.log('Mini App SDK ready');
        } catch (error) {
          console.error('Error initializing SDK:', error);
        }
      }
    };
    load();
  }, [isSDKLoaded]);

  const handleConnect = () => {
    // Add haptic feedback
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(100)
    }
    router.push('/map')
  }

  return (
    <main className="min-h-screen">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="skeleton w-32 h-32 rounded-full"></div>
        </div>
      }>
        {isSDKLoaded && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm z-50">
            Mini App Ready
          </div>
        )}
        
        <div
          className="relative flex size-full min-h-screen flex-col bg-white justify-between group/design-root overflow-x-hidden"
          style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
        >
          <div className="flex-1">
            <div className="@container">
              <div className="@[480px]:px-4 @[480px]:py-3">
                <div
                  className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-white @[480px]:rounded-xl min-h-80"
                  style={{
                    backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB_Ye7-3ttJ5h5eJbOWY4uRGbUAQd-SSe0w-al1RrGEQEJy77MfzMrSeo3IXJNYHVL2k9j5vHX8vjxeRETz-HCOkzv51s_Jv6coCkzvXxZPhyKdVjkntqrHhJeM9ELzOx5-ZbimqmFFU1ihx-noxDddPkqo9FFM_Zi1XmfLdRzX6Can0fXk2UhVcFp1DYiro3HZgTkKXqdRWT-LgKyIItYrlNtzjLikXxLktlCjEwvEgBut70nVO3_81Lf_TGXNjUVfmQlAG6RX1A_7")'
                  }}
                />
              </div>
            </div>
            
            <h2 className="text-[#181511] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
              Vendor Wars: Fight for Your Barrio!
            </h2>
            
            <div className="flex px-4 py-3 justify-center">
              <Button
                onClick={handleConnect}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 bg-[#f2920c] text-[#181511] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#e0850b] active:scale-95 transition-transform touch-manipulation"
                style={{ minHeight: '48px' }}
              >
                <span className="truncate">Connect with Farcaster</span>
              </Button>
            </div>
            
            <div className="flex px-4 py-3 justify-center">
              <Button
                variant="outline"
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#f5f3f0] text-[#181511] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#ebe8e4] border-[#f5f3f0] active:scale-95 transition-transform touch-manipulation"
                style={{ minHeight: '44px' }}
              >
                <span className="truncate">Learn how it works</span>
              </Button>
            </div>
          </div>
          
          <div className="pb-20 md:pb-0">
            <div className="flex flex-col gap-3 p-4">
              <div className="flex gap-6 justify-between">
                <p className="text-[#181511] text-base font-medium leading-normal">
                  Loading territories...
                </p>
              </div>
              <div className="rounded bg-[#e6e1db] overflow-hidden">
                <div 
                  className="h-2 rounded bg-[#181511] transition-all duration-1000 ease-out skeleton" 
                  style={{ width: '20%' }}
                />
              </div>
            </div>
            <div className="h-5 bg-white" />
          </div>
        </div>
      </Suspense>
    </main>
  )
}
