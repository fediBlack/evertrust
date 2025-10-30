import { http } from './http'

export const Api = {
  getAgent: () => http.get('/my/agent').then((r) => r.data),

  listSystems: (page = 1, limit = 20) =>
    http.get('/systems', { params: { page, limit } }).then((r) => r.data),

  getSystem: (symbol: string) => http.get(`/systems/${symbol}`).then((r) => r.data),

  listWaypoints: (systemSymbol: string, page = 1, limit = 20) =>
    http.get(`/systems/${systemSymbol}/waypoints`, { params: { page, limit } }).then((r) => r.data),

  myShips: (page = 1, limit = 20) =>
    http
      .get('/my/ships', {
        params: { page, limit: Math.min(limit, 20) },
      })
      .then((r) => r.data),

  getShip: (shipSymbol: string) => http.get(`/my/ships/${shipSymbol}`).then((r) => r.data),

  getMarket: (systemSymbol: string, waypointSymbol: string) =>
    http.get(`/systems/${systemSymbol}/waypoints/${waypointSymbol}/market`).then((r) => r.data),

  shipOrbit: (shipSymbol: string) => http.post(`/my/ships/${shipSymbol}/orbit`).then((r) => r.data),

  shipDock: (shipSymbol: string) => http.post(`/my/ships/${shipSymbol}/dock`).then((r) => r.data),

  shipNavigate: (shipSymbol: string, waypointSymbol: string) =>
    http.post(`/my/ships/${shipSymbol}/navigate`, { waypointSymbol }).then((r) => r.data),

  shipRefuel: (shipSymbol: string) =>
    http.post(`/my/ships/${shipSymbol}/refuel`).then((r) => r.data),
}
