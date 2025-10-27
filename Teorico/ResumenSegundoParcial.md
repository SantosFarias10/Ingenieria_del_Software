# Resumen Segundo Parcial

---

# Diseño Detallado

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

---

# Codificacion

## Objetivo

La fase de codificacion representa el momento en el ciclo de vida del desarrollo de software donde el diseño abstracto se traduce en una implementacion concreta. Sin embargo, su importancia estrategica va mucho mas alla de la simple escritura de codigo. Es una actividad que impacta directamente en la calidad, el coste y la longevidad del sistema, afectando de manera critica las fases posteriores de *testing* y *mantenimiento*.
<br> El objetivo principal de la codificacion no es reducir los costos de la impementacion inicial, si no es minimizar los costos a largo plazo asociados con las pruebas y el mantenimiento. Dado que estas fases consumen la mayor parte de los recursos en un proyecto de software, el codigo debe ser optimizado para facilitar el trabajo de quienes lo probaran y mantendran en el futuro.

Un programa se lee mucho mas frecuentemente que el tiempo que demanda su escritura.
<br>Distintos actores interactuan con el codigo a lo largo de su vida util, y la mayor parte de este tiempo se invierte en su lectura y comprension.

* **Programadores**: Leen el codigo repetidamente para depurar errores (*debugging*), extender su funcionalidad o modificar su comportamiento.
* **Mantenedores** (quienes mantienen el codigo): Invierten un esfuerzo considerable en leer y comprender codigo, a menudo escrito por otros, para corregir fallos o adaptarlos a nuevos requisitos.
* **Otros Desarrolladores**: Leen el codigo existente para integrarlo con nuevas partes del sistema de manera coherente.

La premisa central es contundente: **El codigo debe ser optimizado para ser facil de leer y comprender**, no necesariamente para ser facil de escribir.

## Principios Fundamentales para un Codigo de Alta Calidad

Para alcanzar una alta productividad sin sacrificar la calidad, los programadores deben adherirse a principios de programacion bien establecidos. Estos principios actuan como guias para escribir programas simples, legibles y con la menor cantidad de errores posibles, sentando las bases para un software que sea robusto, comprensible y, fundamentalmente, facil de mantener y evolucionar. Dos de los pilares historicos mas importantes son la **Programacion Estructurada** y el **Ocultamiento de la Informacion**.

### Programacion Estructurada: Alinear la Ejecucion con la Lectura

La programacion estructurada, surgida en la decada de los 70's como reaccion al uso indiscriminado de sentencias de controlo como `goto`, busca simplificar la estructura de los programas para que sea mas facil razonar sobre su comportamiento. Su objetivo es alinear la **Estructura Dinamica** (el orden en que las sentencias se ejecutan) con la **Estructura Estatica** (el orden en que las sentencias aparecen en el codigo).

Cuando un programador analiza un programa para verificar su correccion, razona sobre el codigo estatico. Sin embargo, el comportamiento real del programa esta determinado por su flujo de ejecucion dinamico. Sin ambas estructuras no se corresponden, la terea de predecir el comportamiento del programa se vuelve extremadamente compleja.

La programacion Estructurada resuelve este problema utilizando exclusivamente constructores de control de **Unica Entrada** y **Unica Salida** (como la secuencia, `if` y `while`). Estos constructores garantizan que el flujo de control sea lineal y predecible, haciendo que el orden de ejecucion coincida con el orden de lectura. Estas correspondencia directa simplifica drasticamente la comprencion, el analisis y la verificacion (formal o informal) de la correccion del codigo.

### Ocultamiento de la Informacion: Reducir el Acoplamiento

El principio de ocultamiento de la informacion postula que las estructuras de datos de un modulo deben ser privadas y accesibles unicamente a traves de un conjunto de funciones de acceso publicas. En lugar de permitir que otros modulos manipulen directamente los datos internos, se les obliga a interactuar a traves de una interfaz bien definida.

El impacto estrategico de esta practica es inmenso: **Reduce el Acoplamiento** entre los modulos del sistema. Si la implementacion interna de una estructura de datos cambia, solo es necesario modificar el modulo que la contiene; los modulos que la utilizan a traves de su interfaz publica no se ven afectados. Este principio es la base de paradigmas modernos como la Programacion Orientada a Objetos (POO) y el desarrollo basado en componentes, y su adopcion es fundamental para construir sistemas modulares y escalables.

Otras practicas de programacion que contribuyen a la calidad del codigo:

| Práctica Recomendada | Justificación |
| :--- | :--- |
| Limitar la variedad de constructores de control | Utilizar un conjunto pequeño y bien entendido de constructores estructurados simplifica la lectura del código. |
| Evitar el uso de goto | Su uso rompe el flujo lineal del programa, dificultando el razonamiento. Debe limitarse a casos excepcionales. |
| Aplicar el Ocultamiento de la Información | ¡Usarla! Es un principio fundamental para reducir el acoplamiento y crear sistemas modulares. |
| Utilizar tipos definidos por el usuario | Aumenta la legibilidad y la expresividad del código, haciendo más claro el propósito de las variables. |
| Mantener los módulos cortos | Los módulos largos suelen tener baja cohesión, es decir, agrupan responsabilidades que no están relacionadas. |
| Crear interfaces de módulo simples | Una interfaz clara y concisa reduce la carga cognitiva para otros desarrolladores y disminuye el acoplamiento. |
| Garantizar la robustez | Los casos excepcionales son los que tienden a provocar que el programa funcione mal; su manejo riguroso es crítico. |
| Evitar efectos secundarios | Las funciones que modifican estados externos de forma implícita son difíciles de entender, probar y depurar. |
| No dejar bloques catch vacíos | Ignorar una excepción sin realizar ninguna acción puede ocultar problemas serios en el sistema. |
| Evitar if o while vacíos | Es una pésima práctica que genera confusión y puede enmascarar errores lógicos. |
| Utilizar la cláusula default en switch | Asegura que se manejen todos los casos posibles, evitando comportamientos inesperados. |
| Verificar valores de retorno en lecturas | Es una práctica clave para lograr robustez, asegurando que las operaciones de E/S fueron exitosas. |
| Evitar return en bloques finally | Puede suprimir excepciones y ocultar el verdadero resultado de la ejecución de un bloque `try-catch`. |
| Desconfiar de las fuentes de datos | Nunca asumir que los datos de entrada son confiables; deben ser siempre validados y sanitizados. |

## Estandares de Codificacion: La Base de la Legibilidad Colectiva

Dado que los programadores dedican mas tiempo a leer codigo (propio y ajeno) que a escribirlo, la legibilidad es un factor clave para la productividad de un equipo. Los estandares de codificacion son conjuntos de pautas y convenciones que unifican el estilo del codigo fuente, permitiendo que cualquier miembro del equipo pueda entenderlo con mayor rapidez y menor esfuerzo. Aunque pueden variar seguen el lenguaje, la comunidad o la empresa, su proposito es siempre el mismo: Crear una base de codigo coherente y predecible.

Se presentn algunas convenciones comunes, ejemplificadas para el lenguaje de Java:
* **Convenciones de Nombre**:
  * **Paquetes**: Nombre en minuscula (por ejemplo `com.miempresa.util`).
  * **Tipos** (**Clases**, **Interfaces**): Sustantivos que comienzan con mayusculas (por ejemplo `CalculadoraDeImpuestos`).
  * **Variables**: Sustantivos que comienzan con minuscula (por ejemplo `tasaDeInteres`).
  * **Constantes**: Nombres completamente en mayusculas, separando palabras con guion bajo (por ejemplo `TASA_MAXIMA`).
  * **Metodos**: Verbos que comienzan con minusculas (por ejemplo `calcularTotal()`)
  * **Variables y Metodos Booleanos**: Se recomienda prefijar con "is" (por ejemplo `isValido()`).
* **Convenciones de Archivos**:
  * **Extension**: Los archivos fuente deben tener la extension `.java`.
  * **Contenido**: Cada archivo debe contener una unica clase externa, con el mismo nombre que el archivo.
  * **Longitud de Linea**: No debe superar los 80 caracteres para facilitar la lectura en diferentes pantallas.
* **Convenciones de Sentencias**:
  * **Declaracion e Inicialiazacion**: Las variables deben inicializarse al ser declaradas y en ambito (*scope*) mas pequeño posible.
  * **Agrupacion**: Las variables de clase nunca debe ser publicas para respetar el ocultamiento de la informacion.
  * **Visibilidad**: Las variables de clases deben ser publicas para respetar el ocultamiento de la informacion.
  * **Variables de Bucles**: Deben inicializarse justo antes del bucle en el que se usan.
  * **Constructores de Bucles**: Evitar el uso de `break` y `continue`, ya que pueden complicar el flujo de control.
  * **Condicionales**: Evitar ejecutables dentro de la expresiones condicionales.
* **Convenciones de Comentarios y "Layout"**:
  * **Alineacion**: Los comentarios de una sola linea para un bloque de codigo deben estar alineados con dicho bloque.
  * **Variables**: Las variables importantes deben tener un comentario que describa que representan.
  * **Bloque de Comentarios**: Deben comenzar con `/*` en una linea y terminar con `*/` en otra.
  * **Comentarios en Linea**: Los comentarios en la misma linea que una sentencia deben ser cortos y estar alejados a la derecha.

## El proceso de Codificacion: Metodologias y Enfoques

La codificacion no es una actividad monolitica, sino un proceso estructurado que puede seguir diferente metodologias. Una vez que la especificacion del diseño de los modulos esta disponible, estos se asignan a los programadores, quienes pueden adoptar un enfoque *top-down* (desarrollando primero los modulos de alto nivel) o *bottom-up* (comenzando por los del bajo nivel). Independientemente del orden, el proceso de implementacion puede variar significativamente.

### Proceso Basico vs. Incremental

El proceso mas basico y tradicional sigue un ciclo simple:
1. Escribir el codigo completo de un modulo.
2. Realizar tests de unidad sobre el modulo.
3. Si se encuentrar errores, corregirlos (*debug*) y repetir las pruebas hasta que todos pasen.

Un enfoque superior es el **Proceso Incremental**, donde el codigo se desarrolla en pequeños fragmentos funcionales. Despues de añadir cada pequeño incremento, se ejecutan tanto los tests para la nueva funcionalidad como los tests para la funcionalidad existente, asegurando que los cambios no hayan introducido regresiones.

### Desarrollo Dirigido por Tests (TDD)

El **Desarrollo Dirigido por Tests** (*Test-Driven Development* o TDD) invierte el orden del proceso tradicional: El programador escribe los test antes de escribir el codigo funcional. Esta metodologia, popularizada por practicas agiles como *Extreme Programming* (XP), sigue un ciclo corto y repetitivo conocido como **Rojo/Verde/Refactorizacion**:
1. **Rojo**: Se escribe un test automatizado para una pequeña funcionalidad que aun no existe. Como el codigo no se ha implementado, el test falla (se pone en "rojo").
2. **Verde**: Se escribe la cantidad minima de codigo necesaria para que el test pase (se ponga en "verde"). No se busca la solucion mas elegante, solo la que funcione.
3. **Refactorizacion**: Con la seguridad de que el test esta funcionando, se mejora el diseño del codigo recien escrito (se refactoriza) para hacerlo mas limpio, simple y mantenible, sin cambiar su comportamiento externo.

### Beneficios Clave de TDD:

* Asegura que todo el codigo escrito sea inherentemente testeable.
* La responsabilidad de la cobertura funcional recae en la cantidad de los test, no en la implementacion.
* Al escribir los test primero, el desarrollador se enfoca en como se usara el codigo, lo que ayuda a validar y mejorar la interfaz del modulo.

**Advertencias**:
* La completitud del codigo depende directamente de cuan exhaustivos sea los casos de test.
* El codigo generado en la fase "verde" a menudo necesita una refactorizacion posterior para mejorar su diseño.

### Programacion de a Pares (Pair Programming)

Tambien promovido por XP, esta practica consiste en que dos programadores trabajen juntos en una sola estacion de trabajo. Sus roles se dividen y alternan periodicamente:
* Uno de los programadores **Tipea el Codigo** y se concentra en la implementacion tactica.
* El otro **Revisa Activamente** el codigo a medida que se escribe, actuando como un navegador estrategico que detecta errores, considera casos particulares y sugiere mejoras de diseño.

La principal ventaja es que la **Revision de Codigo de Vuelve Continua**, en lugar de ser un paso posterior. Esto a menudo conduce a un mejor diseño de algoritmos y una menor cantidad de errores.

### Control del Codigo Fuente

Una practica esencial en cualquier proyecto profesional es el uso de herramientas de control de codigo fuente (como SVN o CVS). Estas herramientas gestionan un **Repositorio Central**, que es la fuente oficial y controlada de todos los archivos del proyecto. Las operaciones basicas Incluyen:
* `Check out`: Descargar una copia de trabajo realizados localmente al repositorio central, haciendolos disponibles para el resto del equipo.
* `Commit` (o `Check in`): Subir los cambios realizados localmente al repositorio central, haciendolo disponibles para el resto del equipo.
* `Update`: Sincronizar la copia de trabajo local con los ultimos cambios subidos por otros al repositorio.

Estas herramientas mantienen un historial completo de cambios, permitiendo la coordinacion en equipos grandes y la recuperacion de versiones anteriores.
<br>A lo largo de todos estos proceso, existe critica para mantener la salud del codigo a largo plazo: La Refactorizacion.

## Refactorizacion: Mejorando el Diseño del Codigo Existente

Con el tiempo, incluso un sistema con un buen diseño inicial tiende a degradarse a medida que se agregan nuevas funcionalidades y se realizan modificaciones. La **Refactorizacion** es una tecnica diciplinada para reestructurar el codigo existente, alterando su estructura interna para mejorar su diseño, sin cambiar su comportamiento externo observable. Su objetivo no es corregir errores ni añadir funcionalidad, sino combatir la entropia del software y prevenir que el codigo se vuelva cada vez mas complejo y dificil de mantener.

Los conceptos basicos de la refactorizacion se pueden resumir en los siguientes puntos:
* **Objetivos**: Reducir el acoplamiento, incrementar la cohesion y mejorar la adhesion a principios de diseño como el principio abierto-cerrado.
* **Riesgo Principal**: El principal peligro es "romper" accidentalmente la funcionalidad existente al realizar los cambios.
* **Estrategias de Mitigacion**: Para minimizar el riesgo, la refactorizacion debe realizarse en **Pequeños Pasos Incrementales** y, fundamentalmente, apoyarse en una **Suite de Tests Automatizados** que pueda verificar rapidamente que el comportamiento del sistema no ha cambiado.

### Identificacion de "**Malos Olores**" en el Codigo

Los "malos olores" (*bad smells*) son indicios en el codigo que sugieren un problema de diseño subyacente y, por lo tanto, una oportunidad de refactorizacion. No son errores en si mismo, sino sintomas. Algunos de los mas comunes son:
* **Codigo Duplicado**: La misma logica aparece en multiples lugares, lo que complica cualquier modificacion futura.
* **Metodo largo**: Un metodo que intenta hacer demasiadas cosas probablemente tiene baja cohesion y deberia dividirse.
* **Clases Grandes**: Una clase con demasiadas responsabilidades es un candidato para ser descompuesta en clases mas pequeñas y cohesivas.
* **Listas Larga de Parametros**: Una interfaz de metodo compleja puede indicar que se necesita un objeto para agrupar esos parametros.
* **Sentencias `switch`**: A menudo indica una oportunidad perdida para usar polimorfismo, especialmente si estructuras `switch` similares se repiten en varias partes del codigo.
* **Generalidad Especulativa**: Codigo (como jerarquias de clases o parametros) creado para funcionalides futuras que nunca se implementa, añadiendo complejidad innecesaria.
* **Demasiada Comunicacion entre Objetos**: Un alto grado de interaccion entre clases puede indicar bajo encapsulamiento, baja cohesion y alto acoplamiento.
* **Encadenamiento de Mensajes**: Una larga cadena de llamadas (por ejemplo `obj.getA().getB().getC()`) revela un acoplamiento profundo con la estructura interna de otros objetos.

### Tecnicas Comunes de Refactorizacion

Existe un catalogo de tecnicas de refactorizacion probadas para abordar estos "malos olores". Se pueden agrupar en las seguientes categorias:
* **Mejoras de Metodos**:
  * **Extraccion de Metodos**: Dividir un metodo largo en varios metodos mas cortos y descriptivos.
  * **Agregar/Eliminar Parametros**: Simplificar las interfaces de los metodos, añadiendo solo la informacion necesaria y eliminando parametros no utilizados.
* **Mejoras de Clases**:
  * **Desplazamiento de Metodos/Atributos**: Mover un metodo o un atributo a otra clase donde tenga mas sentido (mayor cohesion).
  * **Extraccion de Clases**: Si una clase agrupa multiples conceptos, separarlos en clases distintas.
  * **Reemplazar Valores de Datos por Objetos**: Agrupar un conjunto de atributos relacionados en una nueva clase para crear una entidad logica.
* **Mejoras de Jerarquias**:
  * Subir Metodos/Atributos: Mover funcionalidades o datos duplicados en subclases a la superclase comun.
  * Reemplazar Condicionales con Polimorfismo: Convertir una sentencia `switch` basada en el tipo de un objeto en una jerarquia de clases donde cada subclase implementa su propio comportamiento.

Una vez que el codigo ha sido escrito, mejorado y refactorizado, debe pasar por un proceso de validacion formal antes de ser integrado.

## Verificacion del Codigo: Estrategias para Asegurar la Calidad

Antes de que el codigo escrito por un programador sea integrado en la base de codigo principal o utilizado por otros, debe ser verificado para asegurar su calidad. Este proceso, a nivel de modulo, es complementario al testing de sistema completo y se enfoca en el trabajo individual del programador. Existen varias tecnicas para llevar a cabo esta verificacion.

### Inspeccion de Codigo

La inspeccion de codigo es un proceso de revision formal y estructurada. Un equipo de revisores examina el codigo fuente con el objetivo de encontrar defectos, bugs y desviaciones de los estandares de codificacion. Para guiar el proceso y asegurar la cobertura, se utiliza **Listas de Control** (**`checklists`**) con preguntas especificas, como por ejemplo:
* ¿Se han inicializado todas las variables y punteros antes de su uso?
* ¿Se garantiza que los indices de los arreglos permanezcan dentro de sus limites?
* ¿Se ha verificado que todos los bucles (loops) terminen correctamente?
* ¿Se satisfacen los estandares de codificacion establecidos por el equipo?

Aunque es un metodo muy efectivo para la deteccion de defectos, tambien puede ser costoso, por lo que para codigo no critico a veces se realiza por una sola persona.

### Testing de Unidad (*Unit Testing*)

El testing de unidad se enfoca en verificar el correcto funcionamiento de un modulo o componente de forma aislada. Tipicamente, es realizado por el mismo programador que escribio el codigo. Este proceso requiere:
* **Casos de Test**: Un conjunto de entradas y condiciones de ejecucion diseñada para probar el comportamiento del modulo.
* **"Drivers"**: Pequeños programas o scripts que ejecutan el modulo con los casos de test y verifican que las salidas sean las esperadas.

Es un proceso de desarrollo incremental, es crucial que los test de unidad esten automatizados (por ejemplo, usando frameworks como JUnit), ya que deben ejecutarse repetidamente para detectar regresiones.

### Analisis Estatico y Metodos Formales

* **Analisis Estatico**: Consiste en el uso de herramientas de software que analizan el codigo fuente sin ejecutarlo para encontrar posibles problemas. Son efectivas para detectar errores comunes como *memory leaks*, codigo muerto (inaccesible), o el uso de punteros colgados. Aunque puedan generar "falsos positivos", son una valiosa red de seguridad.
* **Metodos Formales**: Son enfoques basados en la logica matematica que buscan demostrar formalmente la correccion de un programa con respecto a una especificacion. Debido a su complejidad y desafios de escalabilidad, su uso se reserva principalmente para software de mision critica o de alta seguridad, donde un fallo podria tener consecuencias catastroficas.

En resumen, el objetivo de todos estos principios, procesos y tecnicas es producir un codigo de alta calidad. Un codigo que no solo funciona correctamente, sino que es claro, robusto y facil de mantener. Como resume una de las frases más celebres en la materia: "El buen codigo es invisible". Funciona de manera tan fiable y es tan facil de entender que no llama la atencion sobre si mismo, permitiendo que los sistemas evolucionen de forma sostenible a lo largo del tiempo.

---

# Proceso de Software

## Fundamentos del Proceso de Software

### Introduccion Analitica

Un proceso de software bien definido es la base estrategica sobre la cual se construyeen proyectos exitosos. Lejos de ser una formalidad burocratica, un proceso robusto proporciona el marco estructurado necesario para la toma de decisiones, la asignacion de recursos y la ejecucion de tareas. Su proposito fundamental es guiar a los equipos de ingenieria para alcanzar los objetivos del proyecto de manera predecible, gestionando eficazmente las restricciones de costo, tiempo y calidad.

### Analisis de la Dicotomia Procesos vs. Producto

Para comprender la ingenieria del software, es crucial establecer una distincion clara entre el *proceso* y el *producto*.
* **El Proceso**: Corresponde al "como" se realiza el trabajo. Es el conjunto de fases, actividades y metodologias empleadas para desarrollar el software.
* **El Producto**: Es el resultado tangible de ejecutar dicho proceso. Es el "que" se entrega al final del proyecto.

La premisa central de la Ingenieria del Software es que un enfoque disciplinado en el **Proceso** es el medio mas efectivo para lograr **Alta Calidad y Productividad** en el producto final. Es este contexto, un proyecto exitoso se define como aquel que satisface plenamente las expectativas del cliente y los interesados en terminos de costo, tiempo y calidad.

### Evaluacion del Rol de los Modelos de Procesos

Un **Modelo de Proceso** actua como una plantilla general que especifica las fases principales en las que debe dividirse el desarrollo, junto con las restricciones y condiciones para su ejecucion. Sin embargo, es fundamental entender la relacion entre el model y el proceso real de un proyecto:
<br> Un modelo de proceso no se traduce directamente. El proceso real de un proyecto es, en la practica, una **Adaptacion** del model seleccionado para ajustarse a las necesidades y particularidades del proyecto.
<br>Por lo tanto, es el proceso adaptado y definido --No el modelo generico-- el que verdaderamente guia la ejecucion del proyecto e influye de manera significativa en su resultado final.

### Transicion

Comprendida la importancia del proceso, es necesario desglosarlo en sus componentes principales para analizar como se gestionan las diferentes responsabilidades dentro de un proyecto de software.

## Componentes Fundamentales del Proceso de Software

### Introduccion de los Dos Procesos Fundamentales

El proceso global de software se divide en dos componentes principales para separar responsabilidades y optimizar el enfoque. Esta division entre las actividades de construccion y las de gestion es crucial para la eficiencia, permitiendo que los equipos tecnicos se concentren en la ingenieria del producto mientras los administradores se dedican a la planificacion y el control del proyecto.

### Analisis de los Dos Procesos Fundamentales

La estructura de software se cimienta en dos pilares ejecutados para roles distintos:
* **Proceso de Desarrollo**: Se enfoca en las actividades de ingenieria y garantia de calidad necesaria para construir el software. Es ejecutado por los desarrolladores y constituye el "corazon" del proceso global de software.
* **Proceso de Administracion del Proyecto**: Se enfoca en la planificacion y el control de desarrollo para asegurar que se cumplan los objetivos de costo, tiempo y calidad. Es ejecutado por los **Administradores de Proyecto**.

### Visualizacion de la Estructura del Proceso

El Proceso de Desarrollo actua como el nuecleo tecnico del ecosistema de software. Alrededor de este, un conjunto de cinco procesos de soporte lo rodean y habilitan su ejecucion controlada, operando como entidades distintas pero interconectadas.
1. **Proceso de Administracion del Proyecto**.
2. **Proceso de Inspeccion**.
3. **Proceso de Administracion de la Configuracion**.
4. **Proceso de Administracion de Cambios de Requisitos**.
5. **Proceso de Administracion del Proceso**.

Esta estructura asegura que mientras el desarrollo avanza, la gestion, el control de calidad, la configuracion y la mejora continua se manejan de forma paralela y sistematica.

### Transicion

Una vez definido los componentes estructurales, el siguiente paso es explorar las caracteristicas que determinan la efectividad y el valor de estos procesos en la practica.

## Caracteristicas Deseadas de un Proceso de Software Eficaz

### Introduccion Analitica

No todos los procesos de software son iguales ni generan los mismos resultados. Un proceso eficaz debe poseer un conjunto de caracteristicas especificas diseñadas para maximizar la calidad del producto, optimizar los recursos y gestionar el cambio de manera predecible. Estas cualidades transforman el proceso de un simple conjunto de pasos a una herramienta estrategica para el exito del proyecto.

### Evaluacion de las Caracteristicas Clave

#### Produccion de Software Testeable y Mantenible

Un proceso eficaz genera un producto que sea facil de verificar y modificar a lo largo de su ciclo de vida. La Importancia de esta caracteristicas se fundamenta en el alto costo asociado a estas actividades.
* **Testing**: Consume entre el 30% y 50% del esfuerzo totla de desarrollo.
* **Mantenimiento**: Puede llegar a representar hasta el 80% del costo total del software durante su vida util.

#### Eliminacion Temprana de Defectos

El costo de corregir un defecto aumenta exponencialmente a medida que avanza en el proceso de desarrollo. Un error detectado en la fase en que se introdujo es significativamente mas barato de solucionar.
<br>Por ejemplo, corregir un defecto de requerimiento durante la fase de testing puede costar 100 veces mas que si se hubiera corregido durante la propia fase de requerimiento.
<br>Para lograr esta deteccion temprana, la **Verificacion** (la "V" en el enfoque ETVX) en cada fase es una actividad clave.

#### Previsibilidad y Repetibilidad

Un proceso es predecible y repetible cuando su aplicacion en proyectos similares produce resultados consistentes en terminos de costo, esfuerzo y calidad. Esta caracteristica permite que el desempeño pasado se utilice como una base fiable para estimar el desempeño futuro. Un proceso que alcanza este nivel de madurez se considera que esta "bajo control estadistico". Sin esta predictibilidad, cualquier estimacion de calidad y productividad carece de fundamento.

#### Soporte para el Cambio

Los cambios en los requerimientos son una realidad inevitable en el desarrollo de software y no deben ser tratados como un imprevisto negativo. Surgen por diversas razones y pueden ocurrir en cualquier momento del ciclo de vida. Por lo tanto, todo proceso de desarrollo de software debe estar explicitamente diseñado para gestionar y tratar los cambios de manera apropiada y controlada.

### Analisis del Enfoque "ETVX"

Para asegurar la disciplina y el control en cada etapa, se puede utilizar el enfoque ETVX (*Entry*, *Task*, *Verification*, *Exit*) como una estructura formal para cada fase del proceso. Sus cuatro componentes son:
* **Criterio de Entrada** (*Entry*): Define las condiciones que deben cumplirse para poder iniciar la fase.
* **Tarea** (*Task*): Describe el trabajo especifico que debe realizarse dentro de la fase.
* **Verificacion** (*Verification*): Especifica las condiciones que deben cumplirse para considerar que la fase ha concluido exitosamente.

Es fundamental que exista consitencia entre el criterio de salida de una fase y el criterio de entrada de la fase siguiente para garantizar una transicion fluida y sin fisura.

### Transicion

Una vez comprendidas las caracteristicas de un buen proceso, el siguiente paso logico es examinar en datalle las fases que componen el proceso de desarrollo, el nucleo de toda la operacion.

## El Proceso de Desarrollo de Software en Detalle

### Introduccion Estrategica

El proceso de desarrollo es el nucleo de la ingenieria del Software, cuyo objetivo principal es contruir sistemas de alta calidad que cumplan con el presupuesto y el cronograma establecido. Para gestionar la complejidad inherente a esta tarea, el proceso se estructura en un conjunto de fases secuenciales, aplicando una estrategia de "dividit y conquistar". Cada fase aborda una parte especifica del problema, permitiendo una validacion continua del proyecto que avanza.

### Detalles de las Fases del Proceso de Desarrollo

#### Analisis de Requerimiento y Especificacion

* **Objetivo**: Comprender con precision el problema que se debe resolver, especificando el "que" sin entrar en detalles del "como".
* **Tareas Claves**: Esta fase forma la base del acuerdo entre el cliente y el equipo de desarrollo. Es una tarea inherentemente compleja, pues requiere la comprension de un sistema que aun no existe.
* **Producto de Trabajo**: El documento de **Especificacion de los Requerimientos del Software** (SRS).

#### Arquitectura y Diseño

* **Objetivo**: Marcar la transicion del dominio del problema al dominio de la solucion, definiendo el "como" se construira el sistema.
* **Tarea Clave**: Esta fase se descompone en tres actividades principales:
  1. **Diseño Arquitectonico**: Establece los componentes principales del sistema y como se interconectan.
  2. **Diseño de Alto Nivel**: Define los modulos y las estructuras de datos necesarios para implementar la arquitectura.
  3. **Diseño Detallado**: Especifica la logica interna de cada modulo.
* **Producto de Trabajo**: Los Documentos de Diseño correspondientes a cada nivel.

#### Codificacion

* **Objetivo**: Implementar el diseño previamente definido en codigo ejecutable. El foco en producir un codigo que sea simple, legible y facil de comprender.
* **Tarea Clave**: La calidad del codigo generado en esta fase tiene impacto directo en el esfuerzo requerido para el testing y el mantenimiento posterior. Un codigo bien escrito reduce significativamente estos costos.
* **Producto de Trabajo**: El **Codigo** fuente del sistem.

#### Testing

* **Objetivo**: Identificar y eliminar la mayor cantidad posible de defectos introducidos en las fases anteriores para mejorar la calidad del producto final.
* **Tarea Clave**: Es una de las tareas mas caras del ciclo de vida, por lo que debe ser planeada y ejecutada de manera rigurosa y apropiada.
* **Producto de Trabajo**: El Plan de **Test**, los **Resultados** de las pruebas y el **Codigo Final Testeado y Confiable**.

### Transicion

Aunque el proceso de desaroolo es central, su exito depende intrisecamente de un ecosistema de otros proceso de soporte que garantizan la gestion, el control y la calidad en todo el proyecto.

## Procesos Auxiliares Criticos para el Exito del Proyecto

### Introduccion Analitica

El proceso de desarrollo no opera en el vacio. Para ser efectivo, requiere un conjunto de procesos auxiliares que proporcionen la estructura necesaria para gestionar la planificacion, la calidad, la condiguracion y el cambio. Estos procesos de soporte son fundamentales para garantizar que el proyecto se mantengan bajo control, se adapte a las nuevas circunstancias y entregue un producto de alta calidad de manera predecible. 

### Analisis del Proceso de Administracion del Proyecto

* **Proposito**: Asignar y administrar los recursos necesarios (humanos, tecnicos y financieros) para ejecutar las fases de desarrollo de manera eficiente, observar el progreso y tomar acciones correctivas cuando sea necesario.
* **Fases del Proceso**:
  1. **Planeamiento**: Se realiza antes de iniciar el proyecto. Incluye tareas clave como la estimacion de costos y tiempos, la seleccion del personal, la planificacion del seguimiento y la planificacion del control de calidad.
  2. **Seguimiento y Control**: Se ejecuta en paralelo al proceso de desarrollo. Consiste en seguir parametros clave como el costo, el tiempo y el riesgo, utilizando metricas para obtener la informacion necesaria para la toma de decisiones.
  3. **Analisis de Terminacion**: Se lleva a cabo al finalizar el proyecto. Su proposito es analizar el desempeño del proceso e indetificar lecciones aprendidas. En procesos iterativos, este analisis se realiza al final de cada iteracion para mejorar las siguientes.

### Analisis del Proceso de Inspeccion

* **Proposito**: Su objetivo principal es detectar defectos en los productos de trabajo (requerimientos, diseño, codigo, planes, etc.) en la misma fase en que se producen.
* **Impacto**: Se considera una de las mejores practicas de la industria, ya que mejora notablemente tanto la calidad del producto como la productividad del equipo.
* **Metodologia**: Es un proceso estructurado de revision por pares, enfocado exclusivamente en encontrar problemas, no en resolverlo. Se basa en roles definidos:
  * **Moderador**: Responsable general de la inspeccion.
  * **Autor**: Creador del producto de trabajo.
  * **Revisor**: Identifica los defectos.
  * **Lector**: Lee el producto de trabajo en voz alta durante la reunion.
  * **Escriba**: Registra los defectos identificados.
* **Fases del Proceso**:
  * **Planeamiento**: Se selecciona el equipo de revision, se designa al moderador y se prepara el paquete de distribucion con el producto a revisar, sus especificaciones y las listas de control relevantes.
  * **Preparacion y Repaso**: Cada miembro del equipo revisa individualmente el producto de trabajo, utilizando listas de control (*checklists*) para identificar y registrar defectors potenciales antes de la reunion grupal.
  * **Reunion de Revision Grupal**: El lector presenta el producto de trabajo seccion por seccion, el equipo discute las observaciones y el escriba registra formalmente la lista final de defectos. El moderador asegura que el foco se mantenga en la identificacion de problemas.
  * **Coreccion y Seguimiento**: El autor corrige los defectos registrados. Posteriormente, el moderador verifica las correcciones para dar su visto bueno y cerrar formalmente el proceso de inspeccion.

### Analisis del Proceso de Administracion de la Configuracion (SCM)

* **Proposito**: Controlar sistematicamente los cambios producidos en todos los items de un proyecto, incluyendo programas, documentos y datos. El SCM gestiona la evolucion de estos items a traves de su diferentes versiones.
* **Funcionalidades**: Debe permitir evitar cambios desautorizados, revertir a versiones especificas y hacer disponible la ultima version del sistema.
* **Mecanismos Principales**:
  * **Control de Acceso**: Limita quien puede modificar los items.
  * **Control de Versiones**: Preserva el historial de cambios de cada item.
  * **Identificacion de la Configuracion**: Define los componentes que forman el sistema.
* **Concepto Clave**: La **Baseline** (Linea Base) es un punto de referencia que captura el estado logico del sistema en un momento determinado, sirviendo como base para cambios posteriores.

### Analisis del Proceso de Administracion de Cambios de Requisitos

* Proposito: A diferencia del SCM general, este proceso se enfoca especificamente en gestionar los cambios en los requisitos del software. Los cambios no controlados en esta area pueden impactar de forma muy adversa en el costo y el cronograma del proyecto.
* Pasos del Proceso:
  * Registrar la solicitud de cambio.
  * Realizar un analisis de impacto sobre los productos de trabajo.
  * Estimar el impacto del cambio en esfuerzo y cronograma.
  * Analizar el impacto con las personas involucradas (*stakeholders*).
  * Reprocesar los productos de trabajo afectados si el cambio es aprobado.

### Transicion

Una vez que se entienden los procesos que componen un proyecto individual, el siguiente nivel de madurez organizacional implica gestionar y mejorar el propio proceso a lo largo del tiempo.

## Mejora Continua: El Proceso de Administracion de Procesos

### Introduccion Estrategica

Es fundamental diferenciar la administracion del proyecto de la administracion del proceso. Mientras la primera se enfoca en el exito de un proyecto individual con un inicio y un fin definidos, la segunda adopta una vision a largo plazo. Su objetivo es evaluar y mejorar sistematicamente los procesos de la organizacion para aumentar la calidad y la productividad de manera sostenida en todos los proyectos futuros.

### Fundamentos de la Mejora de Procesos

Para poder mejorar un proceso, una organizacion primero debe comprenderlo a fondo. Esto requiere tres acciones fundamentales:
1. **Documentar** el proceso actual de manera clara.
2. **Ejecutarlo** de forma consistente en todos los proyectos.
3. **Recolectar** datos sobre su desempeño para analizar sus fortalezas y debilidades.

Se recomienda que los cambios al proceso se realicen de forma Incremental y Cuidadosamente Seleccionada, en lugar de intentar transformaciones radicales y disruptivas.

### Analisis del Modelo de Capacidades (CMM)

El modelo de Madurez de Capacidades (CMM) es un marco de referencia ampliamente utilizado en la insutria para guiar la mejora de procesos de software. Propone una estructura de cinco niveles de madurez, donde cada nivel establece las bases para alcanzar el siguiente.

1. **Nivel 1 - Ad-Hoc**
2. **Nicel 2 - Repetible**: Se establecen practicas basicas de gestion de proyectos. Las areas de enfoque incluyen:
   * Administracion de requerimientos de software.
   * Administracion de configuracion del software.
   * Planeamiento del proyecto.
3. **Nivel 3 - Definido**: El proceso de software esta documentado y estandarizado para toda la organizacion. Las areas de enfoque incluyen:
   * Definicion del proceso organizacional.
   * Programa de entrenamiento.
   * Revision de pares.
   * Administracion integrada del software.
4. **Nivel 4 - Administrado**: La organizacion controla sus procesos y productos de forma cuantitativa. Las areas de enfoque incluyen:
   * Administracion cuantitativa del proceso.
   * Administracion de la calidad del software.
5. **Nivel 5 - Optimizado**: El enfoque se centra en la mejora continua y proactiva del proceso. Las areas de enfoque incluyen:
   * Prevencion de defectos.
   * Administracion del cambio de tegnologia.
   * Administracion del cambio de proceso.

### Conclusion General

El exito sostenido en la ingenieria del software no es producto del azar, sino el resultado de un enfoque disciplinado y estructurado. La adopcion de un proceso robusto, que abarque desde su definicion fundamental y sus componentes operativos hasta su mejora continua a nivel organizacional, es indispensable para entregar productos de alta calidad de manera predecible y eficiente. Este compromiso con el proceso es lo que distingue a la organiazciones maduras y exitosas en el competitivo campo del desarrollo del software.

---