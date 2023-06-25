import { randomBytes } from 'tweetnacl'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function CreateSwapPage() {
  const navigate = useNavigate()
  useEffect(() => {
    console.log('effect', window.location)
    // tgWebAppStartParam
    const parsedLocation = new URL(window.location.toString())
    const startParam = parsedLocation.searchParams.get('tgWebAppStartParam')

    if (startParam) {
      const url = `/swap/${startParam}`
      console.log('redirect', url)
      navigate(url)
      return
    }
    const randomId = Buffer.from(randomBytes(8))

    const url = `/swap/${randomId.toString('hex')}`
    console.log('redirect', url)
    navigate(url)
  }, [])
  return (
    <>
      <div className="w-full break-all">URL: {window.location.toString()}</div>
    </>
  )
}
