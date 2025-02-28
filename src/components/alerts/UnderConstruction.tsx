import { ConstructionIcon } from "lucide-react"

const UnderConstruction: React.FC = () => {
    return       <div className="h-full flex items-center justify-center">
    <h1 className="flex text-xl border-4 items-center justify-center gap-2 text-primary border border-primary rounded p-6 shadow-xl">
      <ConstructionIcon />
      Under construction
    </h1>
  </div>
}

export default UnderConstruction