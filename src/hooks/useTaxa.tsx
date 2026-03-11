import { useEffect, useState } from "react";
import type { Taxon } from "../types";

interface UseTaxaResult {
    taxa: Taxon[]
    loading: boolean
    error: string | null
}

export function useTaxa(): UseTaxaResult {
    const [taxa, setTaxa] = useState<Taxon[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() =>{
        fetch('/data/taxa.json')
            .then(res => {
                if (!res.ok) throw new Error('Datei nicht gefunden')
                return res.json()
            })
            .then((data: Taxon[]) => {
                setTaxa(data)
                setLoading(false)
            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }, [])

    return { taxa, loading, error }
} 