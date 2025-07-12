
export interface IBGEState {
  id: number
  sigla: string
  nome: string
}

export interface IBGECity {
  id: number
  nome: string
}

const IBGE_API_BASE_URL = "https://servicodados.ibge.gov.br/api/v1/localidades"

export const getStates = async (): Promise<IBGEState[]> => {
  try {
    const response = await fetch(`${IBGE_API_BASE_URL}/estados?orderBy=nome`)
    if (!response.ok) {
      throw new Error("Falha ao buscar os estados do IBGE.")
    }
    const data: IBGEState[] = await response.json()
    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const getCitiesByState = async (
  stateUf: string
): Promise<IBGECity[]> => {
  if (!stateUf) return []
  try {
    const response = await fetch(
      `${IBGE_API_BASE_URL}/estados/${stateUf}/municipios`
    )
    if (!response.ok) {
      throw new Error("Falha ao buscar as cidades do IBGE.")
    }
    const data: IBGECity[] = await response.json()
    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}
