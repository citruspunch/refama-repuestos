import { createContext, useContext, useEffect, useState } from "react"

export const PresentationContext = createContext({ guided: true, replayToken: 0, cue: { values: {} }, title: "" })
export const usePresentation = () => useContext(PresentationContext)
const readOnly = () => {}

export function useCueState(name, initialValue) {
  const { guided, cue } = usePresentation()
  const [local, setLocal] = useState(initialValue)
  const scripted = cue.values[name]
  useEffect(() => {
    if (guided && scripted !== undefined) setLocal(scripted)
  }, [guided, scripted])
  return [guided && scripted !== undefined ? scripted : local, guided ? readOnly : setLocal]
}
