## Definiciones

* **Heuristicas de Diseño**: Conjunto de "*Rules of Thumb*" que generalmente son utiles.
* **Tamaño del modulo**: Indicador de la complejidad del modulo.
* **Alcance del control de un módulo**: Todos los subordinados.
* “***Rule of thumb***”: Por cada módulo, el alcance del efecto debe ser un subconjunto del de control.
* **Estabilidad de un módulo**: la cantidad de suposiciones por otros módulos sobre éste.
* **Metrica de red**: Parte de la hipóstesis que si la impuridad del grafo se incrementa => el acomplamiento se incrementa.

## Metodologia de diseño estructurado

### Paso 4.2: Factorizar los modulos de salida

La factoriazcion de la salida es simetrica:
* Modulos subordinados: Un transformador y modulos de salida.
* Usualmente no deberia haber modulos de entrada.

### Paso 4.3: Factorizar los transformadores centrales

La factorización de los módulos de entrada y salida es simple si el DFD es detallado.
* No hay reglas para factorizar los módulos transformadores.
* Utiliza proceso de refinamiento top-down.
    * **Objetivo**: determinar los subtransformadores que compuestos conforman el transformador.
* Repetir el proceso para los nuevos transformadores encontrados.
* Tratar al transformador como un nuevo problema en sí mismo.
* Graficar DFD.
* Luego repetir el proceso de factorización.
* Repetir hasta alcanzar los módulos atómicos.

### Heuristicas de diseño

* El objetivo siempre es lograr bajo acoplamiento y alta cohesion.
    * Se utilizan heuristicas de diseño para modificar el diseño inicial.
* **Heuristicas de Diseño**: Conjunto de "*Rules of Thumb*" que generalmente son utiles.
* **Tamaño del modulo**: Indicador de la complejidad del modulo.
* Se examinan cuidadosamente los modulos con pocas lineas o +100 lineas.
* La cantidad de flechas de salida no deberian exceder las 5 o 6 lineas, y de llegada deberia maximizarse.
* **Alcance del control de un módulo**: Todos los subordinados.
* “***Rule of thumb***”: Por cada módulo, el alcance del efecto debe ser un subconjunto del de control.

## Verificacion del diseño

Objetivo principal: Asegurar que el diseño implemente los requerimientos (corrección).

* Se realizan analisis de desempeño, eficiencia, etc.
* La revision del diseño es la forma mas comun de realizar la verificacion, las listas de control son muy utiles.
* La calidad del diseño se completa con una buena modularidad.

## Metricas

Proposito: Proveer una evaluacion cuantitativa del diseño, asi el producto final puede mejorarse.

### Tamaño y Complejidad

* El tamaño **Siempre** es una metrica, la complejidad es otra metrica de interes.
    * Ejemplo: Cantidad de modulos + tamaño estimado de cada uno.

### Metrica de red

Se enfoca en la estructura del diagrama de estructuras; se considera un buen diagrama aquel en el cual cada modulo tiene solo un modulo invocador (ya que se reduce el acomplamiento).
* Cuantos mas se desvie de esta forma de arbol, mas impuro es el diagrama:
    * Impureza del grafo = `n - e - 1`, donde `n` son los nodos del grafo, `e` son las aristas del grafo. Esta metrica no tiene en cuenta el uso comun de rutina.
    * Impureza = 0 => arbol.
* A medida que este valor se hace mas negativo, se incrementa la impureza.

### Metrica de estabilidad

La **Estabilidad** trata de capturar el impacto de los cambios de diseño.
* Cuanto mayor estabilidad, mejor.
* **Estabilidad de un módulo**: la cantidad de suposiciones por otros módulos sobre éste.
    * Dependen de la interfaz del modulo y del uso de datos globales.

### Metricas de flujo de informacion

* **Metrica de red**: Parte de la hipóstesis que si la impuridad del grafo se incrementa => el acomplamiento se incrementa. Pero, el acoplamiento tambien se incrementa con la complejidad de la interfaz.

La metricas de flujo de informacion tiene en cuenta:
* La complejidad intra-modulo, que se estima con el tamaño del modulo en LOC.
* La complejidad inter-modulo que se estima con:
    - **Inflow**: flujo de informacion entrante al modulo.
    - **Outflow**: flujo de informacion saliente del modulo.
* La complejidad del diseño del modulo C se define como:
    * $$DC = tamaño * (inflow * outflow)^2$$
    * El cuadrado representa la importancia de la interconexion entre modulos con respecto a la complejidad interna, o sea el tamaño.
    * $(inflow * outflow)$ representa el total de combinaciones de entradas y salidas.

Esta metrica define la complejidad solo en la cantidad de informacion que fluye hacia adentro, hacia afuera y el tamaño del modulo. Tambien vimos que en la metrica de red es importante la cantidad de modulos, y hacia donde fluye la informacion.
* En base a esto, el impacto del modulo empieza a resultar insignificante.
* La complejidad del diseño del modulo C se puede definir como:
    * $$DC = fan_{in} * fan_{out} + inflow * outflow.
    * Donde $fan_{in}$ representa la cantidad de modulos que llaman al modulo C, y $fan_{out}$ los llamados por C.

### ¿Como utilizamos esta metrica?

Se usa el promedio de los modulos y su desviacion estandar para identificar los modulos complejos y los propenso a error.
* Propenso a error si:
    * $$DC > Complej_{media} + desv_{std}$$
    * Notar que esta evaluacion se realiza chequeando contra datos del mismo sistema y no contra datos historicos.
* Complejo si:
    * $$Complej_{media} < DC < Complej_{media} + desv_{std}$$
* Normal en caso contrario.
