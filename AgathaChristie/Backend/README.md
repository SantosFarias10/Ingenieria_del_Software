# Backend
---
# Pasos en Linux
## Requisitos
- Python 3.11.9 para correcto funcionamiento de PonyORM.
Ver aclaracion para cambiar la version al fondo.
---

## Configurar Entorno
- De no haber clonado desde cero el repo, hacer ```git clean -dfx```
- Crear venv ```python -m venv .venv```
- Activar venv ```source .venv/bin/activate```
- Instalar requisitos ```pip install -r requirements.txt```
- Desactivar venv ```deactivate```
---

## Ejecutar Backend
- Estando dentro del directorio principal ```Backend/```, prendemos el servidor backend con uvicorn (ya configurado en el main de main.py) ```python -m app.main```
- Se puede prender con ```uvicorn --host 0.0.0.0 --port 8000 --reload app.main:app```
- Se apaga matando el proceso, ```CTRL+C```
- Este se ejecutara en localhost, para testear se puede usar Postman con los request que estan en **request.txt**.

## Ejecutar Test Endpoints
- Seguir los mismos pasos para ejecutar el Backend (ejecutar el archivo main).
- Luego desde otra consola usar curl y testearlo a mano, con los comentarios encima de cada endpoint en ```endpoints_partida.py```

## Ejecutar Todos Los Tests 
- Debe si o si estar en la version 3.11.9 de python.
- Ejecutar desde ```Backend/```, ```pytest --cov```
---

### Cambiar Version Python en Arch (al menos)
- Descargar ```pacman -S pyenv```
- Agregar en ```.zshrc ó .bashrc``` Por debajo de los export's de ZSH y debajo del source a oh-my-zsh.sh en caso de tenerlo.
```export PYENV_ROOT="$HOME/.pyenv"```
```export PATH="$PYENV_ROOT/bin:$PATH"```
```eval "$(pyenv init -)"```
- Recargar la configuracion del zsh con ```source .zshrc```
- Instalar la version de Python que necesitamos, ```pyenv install 3.11.9```
- Ver las versiones instaladas ```pyenv versions```. La que dice system es probablemente la ultima ```3.13.7``` en este momento.
- Activar la version globalmente para ahorrar configuracion del proyecto ```pyenv global 3.11.9```
- Verificar que se activo ```python -V```
- Para volver a la anterior, ```pyenv global system```
