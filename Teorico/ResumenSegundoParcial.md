# Resumen Segundo Parcial

El diseño detallado es una fase fundamental dentro del ciclo de vida del desarrollo de software, actuando como el puente entre el diseño de alto nivel (Arquitectura del sistema) y la implementacion final del codigo. Mientras que el diseño de alto nivel define la estructura y los componentes del sistema, no especifica la logica interna de dichos componentes. Dicha tarea es la responsabilidad central del diseño detallado, que se enfoca en **definir los algoritmos y las estructuras de datos de cada modulo**.

Para especificar esta logica, la eleccion de una notacion adecuada es crucial. Sin embargo, las opciones tradicionales presentan limitaciones significativas:
* **Lenguaje Natural**: A pesar de su accesibilidad, se considera fundamentalmente **Impreciso** y **Ambiguo**. Esta falta de rigor a menudo conduce a problemas de comprension y a interpretaciones erroneas entre los miembros del equipo.
* **Leguajes Formales**: Los lenguajes de programacion o de especificacion formal ofrecen una precision absoluta. No obstante, su nivel de detalle esta orientada a la implementacion y a la maquina, no a la comunicacion humana, por lo que este exceso de informacion (como la sintaxis estricta y las declaraciones de bajo nivel) actua como un "**Estorbo para la comprension**" del diseño conceptual.

Ante este panorama, se hace evidente la necesidad de una herramienta intermedia que combine la claridad conceptual del lenguaje natural con la precision estructural de un lenguaje formal, permitiendo a los diseñadores especificar la logica de manera efectiva sin ahogarse en detalles de implementacion.

## PDL: Process Design Language

El **Lenguaje de Diseño de Procesos** (PDL) surge como la solucion ideal para abordar las deficiencias de los lenguajes formales y naturales. Proporcionan un medio para **describir la logica de un algoritmo** con un equilibrio optimo entre **precision**, **nivel de detalle** e **independencia** de la tegnologia de implementacion, convirtiendose en una **herramienta indispensable** en el diseño detallado.

### Caracteristicas y Aplicaciones

Un lenguaje de diseño efectivo debe cumplir con ciertos requisitos claves. El PDL esta diseñado para satisfacer estas necesidades:
1. Ser tan preciso como sea posible.
2. No requerir un nivel de datalle excesivo.
3. Ser independiente del lenguaje de implementacion final.
4. Poder convertirse facilmente en codigo durante la fase de implementacion.

El PDL adopta la sintaxis y las construcciones de un lenguaje de programacion estructurado (como `IF-THEN-ELSE` o `DO-WHILE`), pero utiliza el vocabulario flexible y descriptivo de un lenguaje natural para expresar las operaciones y condiciones.

Sus aplicaciones clave incluyen la especificacion del diseño completo, desde la arquitectura hasta la logica de un modulo individual. Ofrece al diseñador la flexibilidad de decidir el grado de detalle necesario para cada componente, lo que lo hace particularmente util cuando se combina con la tecnica de **Refinamiento top-down**. Ademas, su naturaleza estructurada permite ciertos grados de procesamiento automatizado, como la verificacion de consistencia.

### Ventajas y Desventajas

| Ventajas | Desventajas |
|---|---|
| Se puede integrar con el código fuente, facilitando su mantenimiento. | No es capaz de expresar la funcionalidad de una manera comprensible. |
| Permite la declaración tanto de datos como de procedimientos. | La notación es comprensible para personas con manejo de PDL. |
| Es una forma barata y efectiva de modificar la arquitectura. | |

### Constructores Fundamentales

El PDL se basa en un conjunto de constructores estructurados simples pero potentes:
* `IF-THE-ELSE`: Utiliza una estructura condicional similar a la de lenguajes como Pascal. Las condiciones no necesitan ser formalmente rigurosas.
* `CASE`: Proporciona una sentencia general para seleccion multiple basada en un tipo. Por ejemplo:
  * `CASE OF transaction type`.
  * `CASE OF operator type`.
* `DO`: Se utiliza para indicar una repeticion o bucle. El criterio de iteracion puede expresarse de manera informal. Por ejemplo:
  * `DO WHILE there are chars in the input`.
  * `DO UNTIL the end of file is reached`.
  * `DO FOR each item in the list EXCEPT when item is zero`.
* **Estructura de Datos**: Permite la definicion y el uso de una gran variedad de estructura de datos, como listas, tablas, arreglos y registros, para representar la informacion que manipula el algoritmo.

### Ejemplo

En el ejemplo se muestra el diseño en PDL para un algoritmo que encuentra el valor minimo y maximo en un archivo.

```
minmax (in file) ARRAY a
DO UNTIL end of input
    READ an item into a
ENDDO

max, min := first item of a
DO FOR each item in a
    IF max < item THEN set max to item
    IF min > item THEN set min to item
ENDDO
END
```

## El Proceso de Diseño de la Logica del Algoritmo

El objetivo principal del diseño detallado es especificar la logica de los modulos definidos en la arquitectura del sistema. Dado que no existen procedimientos rigidos o formulas exactas para diseñar algoritmos, el proceso se basa en heuristicas y metodos probados. Entre ellos, el **Refinamiento Paso a Paso** (o top-down) es el mas comunmente utilizado por su enfoque sistematico y gradual.

### El Metodo de Refinamiento Paso a Paso

Este metodo consiste en desarrollar el algoritmo de manera incremental, partiendo de una idea abstracta y añadiendo detalles en sucesivas etapas.
1. **Comenzar** con una descripcion abstracta del algoritmo, derivada directamente de la especificacion del modulo.
2. En cada paso, **Descomponer** una o mas sentencias del algoritmo, derivada directamente de la especificacion del modulo.
3. **Terminar** el proceso cuando todas las instrucciones sean lo suficientemente precisas como para poder convertirlas facilmente al lenguaje de programacion elegido.

Para que este proceso sea efectivo, se deben seguir dos pautas cruciales:
1. El refinamiento debe aplicarse tanto a las **instrucciones** como a las **Estructuras de Datos** que estas manipulas.
2. Cada paso de descomposicion debe ser pequeño y manejable, representando una o mas decisiones de diseño a la vez para mantener la claridad y el control.

### Ejemplo

Para ilustrar este metodo, se puede analizar el refinamiento de un algoritmo de ordenacion como "selection sort".

**Versio 1: Nivel Abstracto**. El primer nivel describe la logica general en terminos muy amplios, especificando el objetivo principal sin entrar en detalles de como lograrlo.

Sea `n` la longitud del arreglo a ordenar `a`;
```
i := 1;
DO WHILE i < n
    encontrar el menor de ai...an, e intercambiarlo con el elemento de la posición i;
    i := i + 1;
ENDDO;
```

**Version 2: Refinamiento del Bucle Interno**. El segundo nivel refina la instruccion abstracta "encontrar el menor ..." implementandola con un bucle anidado (`DO WHILE j > 1`) que recorre los elementos posteriores para comparar `a(i)` con cada `a(j)` y realizar un intercambio si es necesario.

Sea `n` la longitud del arreglo a ordenar `a`;
```
i := 1 ;
DO WHILE i < n
    j := n;
    DO WHILE j > i
        IF a(i) > a(j) THEN intercambiar los elementos en las posiciones j e i;
        ENDIF;
        j := j - 1;
    ENDDO;
    i := i + 1;
ENDDO;
```

**Version 3: Refinamiento de la Operacion del Intercambio**. El tercer y ultimo nivel detalla la operacion "intercambiar los elementos", especificando los pasos exactos con una variable temporal `x`. En este punto, el pseudocodigo es tan preciso que su traduccion a un lenguaje de programacion es directa.

Sea `n` la longitud del arreglo a ordenar `a`;
```
i := 1 ;
DO WHILE i < n
    j := n;
    DO WHILE j > i
        IF a(i) > a(j) THEN
            x := a(i);
            a(i) := a(j);
            a(j) := x;
        ENDIF;
        j := j - 1;
    ENDDO;
    i := i + 1;
ENDDO;
```

Una vez que el diseño del algoritmo esta completo, es fundamental verificar su correccion y calidad antes de proceder a la codificacion.

## Verificacion del Diseño Detallado

El objetivo de la verificacion es demostrar que el diseño detallado cumple de manera rigurosa con las especificaciones establecidad en el diseño del sistema. Este paso de control de calidad es crucial para detectar errores de logica, inconsistencias o desviaciones de los requisitos antes de que se invierta tiempo y esfuerzo en la codificacion, donde su coreccion seria mucho mas costosa.

### Metodos de Verificacion

Existen 3 metodos principales para llevar a cabo la verificacion del diseño detallado:
* **Recorrido del Diseño**: Se trata de una reunion informal entre el diseñador y un lider de equipo u otro diseñador. En esta sesion, el autor explica el diseño paso a paso, permitiendo que un segundo par de ojos identifique posibles fallos, ambiguedades o areas de mejoras.
* **Revision Critica del Diseño**: Este es un proceso mas formal que sigue los estandares de revision de la organizacion. A menudo se utilizan **Listas de Control** (Checklists) para asegurar que el diseño se evalua sistematicamente contra criterios predefinidos de calidad, completitud y cumplimiento de estandares.
* **Verificadores de Consistencia**: Este metodo es aplicable unicamente cuadno el diseño se ha expresado en PDL o en otro lenguaje formal. Se utilizan herramientas automatizadas para asegurar la consistencia del diseño, comprobando que los modulos invocados existen y que las interfaces (parametros) se utilizan correctamente.

Mas alla de la verificacion funcional, tambien es importante medir cuantitativamente las caracteristicas del diseño para evaluar su complejidad y mantenibilidad.

## Metricas Clave en el Diseño Detallado

Aunque muchas metricas de software se aplican tradicionalmente el codigo fuente, su utilidad se extiende a la fase de diseño detallado. Esto se debe a que el diseño detallado, especialmente cuando se expresa en PDL, ya contiene una gran cantidad de detalles sobre la logica de control y la estructura de datos. Dado que el PDL formaliza la logica de control (bucles, condicionales) y las interacciones de datos, permite un analisis cuantitativo temprano, algo imposible de hacer con descripciones en lenguaje natural.

### Analisis de Metricas Especificas

Evaluar el diseño con metricas permite anticipar la complejidad, el esfuerzo de prueba y la calidad del software resultante.
* **Complejidad Ciclomatica**: Esta metrica mide el numero de caminos de ejecucion independientes en un algoritmo. Su valor determina la cota superior del numero de pruebas necesarias para garantizar que cada sentencia del codigo se ejecute al menos una vez. Un valor alto sugiere una logica compleja, dificil de probar y mantener.
* **Vinculos de Datos**: Esta metrica mide la complejidad de un modulo basandose en sus condiciones y sentencias de control. Adicionalmente, captura la interaccion de datos entre modulos a traves de las invocaciones. Estos vinculos determinan el nivel de **Acoplamiento**: un alto numero de vinculos puede indicar un acoplamiento excesivo, lo que hace que el sistema se mas dificil de modificar.
* *Metrica de Cohesion*: Mide la dependencia funcional entre los distintos elementos dentro de un mismo modulo. Un valor de cohesion alto es deseable, ya que indica que cada ejecucion posible del modulo utiliza todos sus recuros internos (variables) para cumplir una unica funcion bien definida.

En resumen, el diseño detallado, apoyado en herramientas como el PDL, proceso como el refinamiento paso a paso, y validado mediante verificacion y metricas, constituye una fase critica. Es la ultima oportunidad para asegurar la creacion de un software robusto, comprensible y mantenible antes de escribir la primera linea de codigo de implementacion.