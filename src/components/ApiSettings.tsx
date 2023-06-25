// export function ApiSettings() {
//   const [isTestnet, setTestnet] = useLocalStorage('ninja_is_testnet', 'false')

//   const tonClient = useTonClient()

//   useEffect(() => {
//     console.log(
//       'set ton client',
//       isTestnet ? 'https://testnet-v4.tonhubapi.com' : 'https://mainnet-v4.tonhubapi.com'
//     )
//     tonClient.set(
//       new TonClient4({
//         endpoint: isTestnet
//           ? 'https://testnet-v4.tonhubapi.com'
//           : 'https://mainnet-v4.tonhubapi.com',
//       })
//     )
//   }, [isTestnet])

//   return (
//     <div className="my-2">
//       <div>
//         <label htmlFor="apiTestnetInput">Is Testnet:</label>
//         <input
//           className="ml-2 bg-slate-200 rounded"
//           type="checkbox"
//           id="apiTestnetInput"
//           checked={isTestnet === 'true'}
//           onChange={(e) => setTestnet(String(e.target.checked))}
//         />
//       </div>
//     </div>
//   )
// }
