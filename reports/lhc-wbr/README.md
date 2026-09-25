# Weekly Business Review — La Hora de las Compras

Salida y memoria de la rutina `/wbr` (ver `.claude/commands/wbr.md`).

- `AAAA-Wss.html` — el reporte de cada semana (branding LHC, proyectable). `latest.html` es siempre el último.
- `history/AAAA-Wss.json` — los KPIs de cada semana, solo datos. Es la memoria que permite comparar con semanas parecidas.
- `learnings.md` — aprendizajes acumulados, semana a semana.
- `goals.json` — metas mensuales (opcional). Ejemplo:

```json
{ "2026-09": { "ventas": 320, "facturacion": 190000000, "gasto_pauta": 22000000 } }
```

- `inbox/` — datos que no tienen fuente conectada (por ejemplo, cantidad de videos publicados en la semana). Un archivo `.md`, `.txt` o `.csv` con la cifra y la fecha alcanza.
- `assets/` — logo e isotipo de LHC.

Corre todos los viernes 11:51 (hora de Asunción) como Routine, y a mano con `/wbr`.
