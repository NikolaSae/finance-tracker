'use client'
import { useState, useEffect } from 'react'
import { DataTable } from '@/components/DataTable'

type VasPostpaidTable = {
  id: number
  Proizvod: string
  Mesec_pruzanja_usluge: string
  Jedinicna_cena: number
  Broj_transakcija: number
  Fakturisan_iznos: number
  Provajder?: string
}

export default function Home() {
  const [data, setData] = useState<VasPostpaidTable[]>([])
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async (page = 1, pageSize = 20) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch(`api/vas-postpaidd?page=${page}&pageSize=${pageSize}`)
      
      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`)
      }

      const responseData = await res.json()
      console.log('Raw API Response:', responseData)

      // Proširena validacija: podržavamo scenarij gde API vraća samo niz ili objekat sa data/meta
      let finalData: any[] = []
      let finalMeta = {
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0
      }

      // Scenario 1: API vraća samo niz
      if (Array.isArray(responseData)) {
        finalData = responseData
        finalMeta = {
          total: responseData.length,
          page: 1,
          pageSize: responseData.length,
          totalPages: 1
        }
      }
      // Scenario 2: API vraća data/meta format
      else if (responseData?.data && responseData?.meta) {
        finalData = responseData.data
        finalMeta = responseData.meta
      }
      // Scenario 3: Neočekivan format
      else {
        throw new Error('API format nije prepoznat')
      }

      // Dodatna validacija podataka
      const isValid = finalData.every((item: any) => (
        typeof item.id === 'number' &&
        typeof item.Proizvod === 'string' &&
        /^\d{4}-\d{2}$/.test(item.Mesec_pruzanja_usluge) &&
        !isNaN(item.Jedinicna_cena) &&
        !isNaN(item.Broj_transakcija) &&
        !isNaN(item.Fakturisan_iznos)
      ))

      if (!isValid) {
        throw new Error('Podaci imaju nevalidne vrednosti')
      }

      setData(finalData)
      setMeta(finalMeta)

    } catch (err) {
      console.error('Greška:', err)
      setError(err instanceof Error ? err.message : 'Nepoznata greška')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">VAS Postpaid Analiza</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Greška: {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center">Učitavam podatke...</div>
      ) : (
        <DataTable 
          data={data}
          meta={meta}
        />
      )}
    </div>
  )
}
