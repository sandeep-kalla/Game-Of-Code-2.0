import Image from 'next/image'

export function SocietyLogos() {
  return (
    <div className="fixed bottom-4 right-4 flex items-center space-x-2 z-50">
      <Image
        src="/tech-shuttle-logo.png"
        alt="Tech Shuttle Logo"
        width={80}
        height={80}
        className="rounded-full"
      />
      <Image
        src="/gdsc-logo.png"
        alt="GDSC Logo"
        width={80}
        height={80}
        className="rounded-full"
      />
    </div>
  )
}
