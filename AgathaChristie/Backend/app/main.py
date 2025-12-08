import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi import WebSocket, WebSocketDisconnect
from fastapi import FastAPI
from asyncio import sleep

from app.db.database import init_pony

from app.api.endpoints_partida import router as partida_router
from app.api.endpoints_jugador import router as jugador_router
from app.api.endpoints_carta import router as carta_router
from app.api.endpoints_turno import router as turno_router
from app.api.endpoints_mazo import router as mazo_router
from app.api.endpoints_eventos import router as eventos_router
from app.websocket.connection_manager import manager
from app.websocket.estado_partida import construir_estado_partida


app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cambiar a =origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)
app.include_router(partida_router, tags=["partida"])
app.include_router(jugador_router, tags=["jugador"])
app.include_router(carta_router, tags=["carta"])
app.include_router(turno_router, tags=["turno"])
app.include_router(mazo_router, tags=["mazo"])
app.include_router(eventos_router, tags=["eventos"])

init_pony()

@app.get("/")
async def root():
    return {"message": "Wolovers presenta Death On The Cards"}

# para testear con Postman:
# crear pedido websocket a: ws://localhost:8000/ws/partida/jugadores/INSERTE_PARTIDA_ID
@app.websocket("/ws/partida/jugadores/{partida_id}")
async def ws_jugadores_partida(ws: WebSocket, partida_id: int | None):
    # Una vez establecida la conexion del websocket, se crean los eventos (los datos que se envian)
    # en el connection manager.

    if partida_id is None:
        await ws.close(code=1008, reason="partida_id requerido")
        return

    # Registrar la conexion
    await manager.connect(ws, partida_id)

    try:

        # Para mantener la conexion viva
        while True:
            await sleep (1)

    except WebSocketDisconnect:
        print(f"Cliente desconectado de partida {partida_id}")
    except Exception as e:
        print(f"ERROR WS en partida {partida_id}:", repr(e))
    finally:
        # Siempre desregistrar la conexion
        await manager.disconnect(ws, partida_id)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

