# Resumen para el primer parcial

## Desafios de la Ingenieria del Software

* ### Escala

La Ingenieria del Software debe tener en cuenta la **Escala** del software a desarrollar, ya que no siempre los metodos para solucionar pequeños problemas funcionan con problemas de mayor magnitud. Por lo que, estos metodos deben tener la **Capacidad de Adaptacion** y **Respuesta** del mismo a medida que aumentan la cantidad de usuarios o requerimientos.

* ### Calidad

Otro motivo de la Ingenieria del Software es la **calidad**, la definicion estandar se basa en 6 aspectos:

1. **Funcionalidad**: Capacidad de proveer funciones que cumplen la necesidad establecidas.
2. **Confiabilidad**: Capacidad de realizar las funciones necesitadas en un tiempo determinado.
3. **Usabilidad**: Capacidad de ser comprendido, aprendido y usado.
4. **Eficiencia**: Capacidad de proveer desempeño apropiado en base a la cantidad de recursos usados.
5. **Mantenibilidad**: Capacidad de ser modificado con el proposito de corregir, mejorar o adaptar.
6. **Portabilidad**: Capacidad de ser adapatado a otro entorno sin necesidad de realizar muchos cambios.

* ### Productividad

Otro desafio de la Ingenieria del Software es que si un software que demora mucho tiempo en ser entregado o uno barato y de mala calidad son inaceptables. El costo del software se mide por P/M. La **Productividad** `si es alta => menor costo / Menor tiempo`.

* ### Consistencia

Un objetivo clave de la Ingenieria del software es la sucesiva produccion de sistemas de alta calidad y con alta productividad. Esta **Consistencia** es la que nos permite predecir el resultado del proyecto con certeza. Sin esta consistencia seria imposible estimar costos.

* ### Cambios

El software debe cambiar para adaptarse a los cambios de la institucion/empresa. La practica de la Ingenieria del Software debe preparar al software para que estos cambios no sean abruptos, o sea que este facilmente modificable. Los metodos que producen alta calidad, si no permiten cambios, no son utiles.

## Proceso de Desarrollo en Fases

### Fases del Proceso de Desarrollo

1. Analisis y Especificacion de los requerimientos. (salida SRS)
2. Arquitectura.
3. Diseño.
4. Codificacion.
5. Testing.
6. Entrega y Instalacion.

### Entrada y Salida de las fases de desarrollo

???

## Procesos de Requerimientos

**Proceso de Requerimientos**: Secuencia de pasos que se realizan para convertir las necesidades del usuario a una SRS. Este proceso debe recolectar las necesidades, los requerimientos y especificarlos claramente. Se divide en 3 actividades:

1. Analisis del problema o requerimientos.
2. Especificacion de los requerimientos.
3. Validacion

### Analisis de Requerimientos

El analisis se enfoca en la comprension del sistema deseado y sus requerimientos. Se aplica **Divide y Venceras**, o sea se divide el problema en partes mas pequeñas y se intenta comprender estas mini-partes y su relacion entre ellas.
<br>Hay 3 enfoques/métodos para analizar los subproblemas y sus relaciones:
* **Funcional**: Análisis Estructural.
* **Orientado a Objetos**: Análisis Orientado a Objetos.
* **Eventos del sistema**: Particionado en eventos.

### Modelo de Flujo de Datos (DFD)

Un **DFD** (**Diagrama de Flujo de Datos**) es una representacion grafica del flujo de datos a traves de un sistema, es un grafo logico del plan de trabajo que se ejecutara para la solucion de un determinado problema. Se enfoca en que hacen los transformadores y no en como lo hacen, por lo que se muestran entradas y salidas mas importantes. No ha loops ya que no presentan la nocion de control de flujo de datos.
<br>Los pasos del metodo de analisis estructurado son:
1. **Dibujar el diagrama del contexto**.
   * Ve el sistema completo como un transformador e identifica el contexto, es un DFD con unico transformador (el sistema), con entradas, salidas, fuentes, y sumideros del sistema identificado.
2. **Dibujar el DFD del sistema existente**.
   * El sistema actual se modela tal como es un DFD con el fin de comprender el funcionamiento, cada burbuja representa un transformador logico de algunos datos.
3. **Dibujar el DFD del sistema propuesto**.
   * Se utilizan conocimientos existentes, el DFD debe modelar el sistema propuesto completo: Ya sean procesos automatizados o manuales. Establece la frontera hombre-maquina: Que procesos se automatizaran y cuales permaneceran manuales.

### Modelo Orientado a Objetos

En este metodo el sistema es visto como un conjunto de objetos interactuando entre si, o con el usuario a traves de servicios (metodos) que cada objetos provee, los **Objetivos** son:
1. Identificar las clases del dominio.
2. Definir dichas clases identificando sus atributos y metodos.
3. Identificar las relaciones entre dichas clases sea atraves de jerarquias o de los metodos.

El sistema consta de objetos:
* Donde cada objeto tiene Atributos que juntandolos definen al objeto en si.
* Los objetos de tipos similares se agrupan en clases.
* Un objeto provee servicios o realiza operaciones.
  * Estos servicios son los unicos medios que permiten ver o modificar el estado de un objeto.
  * Los sevicios se acceden a traves de mensajes que se envian los objetos.

**Ventajas**:
* Mas facil de hacer y entender.
* La transicion del analisis orientado a objetos al diseño (orientado a objetos) parece ser mas simple.
* Es mas resistente/adaptable a cambios ya que los objetos son mas estables que los funcionales.

Los pasos mas significativos para realizar el **Analisis** Orientado a Objetos son:
* Identificar objetos y clases.
* Identificar Estructuras.
* Identificar Atributos.
* Identificar Asociaciones.
* definir Servicios.

### Prototipado

Se construye un sistema parcial prototipico. Los desarrolladores, clientes y usuarios lo utilizan para comprender mejor el problema y las necesidades sirviendo de ayuda visual al sistema final. Este prototipo puede ser descartable o evolutivo, siendo el primero de estos el mas utilizado.

## Especificacion de los Requerimientos

Al terminar la etapa de especificacion la salida es la SRS, que es construida a base al conocimiento adquirido durante la etapa de Analisis pero enfocado en el comportamiento externo del sistema.

### Caracteristicas de la SRS

* **Correcta**: Cada requerimiento representa precisamente alguna caracteristica deseada por el cliente en el sistema final.
* **Completitud**: Toda caracteristica deseada por el cliente estan descriptas.
* **No Ambigua**: Si para cara requerimiento existe un solo significado.
* **Consistente**: Ningun requerimiento contradice a otro.
* **Verificable**: Si existe para cada requerimiento algun proceso efectivo que puede asegurar que el software final satisface el requerimiento.
* **Rastreable**: Se debe poder determinar el origen de cada requerimiento y como este se relaciona a los elementos del software.
* **Modificable**: Si la estructura y estilo de la SRS es tal que permite incorporar cambios facilmente preservando completitud y cosistencia.
* **Ordenada en Aspectos de Importancia y Estabilidad**: Los requerimientos pueden ser criticos, importantes pero no criticos, deseables pero no importantes.

### Casos de Usos

**Casos de Usos**: Captura el comportamiento del sistema como **Interaccion** de los usuarios con el sistema. Se enfoca solo en la especificacion de la funcionalidad.

**Actor**: Una persona o un sistema que interactúa con el sistema propuesto para alcanzar un objetivo.

**Actor Primario**: El actor principal que inicia el caso de uso.

**Escenario**: Es un conjunto de acciones realizadas con el fin de alcanzar un objetivo bajo determinadas condiciones

**Escenario Principal**: Cuando todo funciona normalmente y se alcanza el objetivo.

**Escenario Excepcional**: Cuando algo sale mal y el objetivo no puede ser alcanzado.

### Errores Comunes de los Casos de Usos 

* Debe siempre haber **Interacción** entre los escenarios exitosos.
* Un caso de uso nunca puede ser **Iniciado** por el sistema.
* Los **Escenarios Excepcionales** deben siempre referenciar a un punto de los exitosos donde del sistema chequea algo.
* Las **Precondiciones** de casos generales deben implicar las de los casos que se referencian dentro.
* **No es Programar**, no debe haber "si pasa esto bla bla, si no pasa blabla”.

## Validacion de los Requerimientos

Debido a la misma naturaleza de esta etapa, hay muchas posibilidades de malentendidos. Mientras mas se avanza en el desarrollo mas caro es corregir y encontrar dichos errores, por lo cual arreglarlos en esta etapa es crucial.
<br>La SRS se revisa por un grupo de personas conformado por: **Autor**, **Cliente**, **Representantes de Usuarios** y de **Desarrolladores**, donde deben estar los clientes y usuarios. Existen herramientas para el modelado y análisis de especificaciones.

## Punto Funcion

Estimador similar a la metrica LOC que se determina solo con la SRS definiendo el tamaño en terminos de "Funcionalidad". 
<br>Tipo de Funciones:
* **Entrada Externas**
  * Tipo de entrada (dato/control) externa a la aplicacion.
* **Salida Externa**
  * Tipo de salida que deja el sistema.
* **Archivos Logicos Externos**
  * Grupo logico de dato/control de informacion generado/usado/manipulado.
* **Archivos de Interfaz Externa**
  * Archivos pesados/compartidos entre aplicaciones.
* **Transacciones Externas**
  * Input/output inmediatos (*queris*).

Cada tipo de funciones se diferencia segun sea **Complejo**, **Promedio** o **Simple**.

**Punto de Funcion NO Ajustado** (**UFP**)
$$\sum_{i=1}^{5} \sum_{j=1}^{3} W_{ij}C_{ij}$$
Donde $C_{ij}$ representa la cantidad de funciones de tipo `i` con complejidad `j`. $W_{ij}$ es el peso.

Luego debemos ajustar UFP de acuerdo a la complejidad del entorno. Se evalúa según las siguientes características:
1. Comunicación de datos
2. Procesamiento distribuido
3. Objetivos de desempeño
4. Carga en la configuración de operación
5. Tasa de transacción
6. Ingreso de datos online
7. Eficiencia del usuario final
8. Actualización online
9. Complejidad del procesamiento lógico
10. Reusabilidad
11. Facilidad para la instalación
12. Facilidad para la operación
13. Múltiples sitios
14. Intención de facilitar cambios

El **Factor de Ajuste de Complejidad** (**CAF**) se calcula como:
$$0.65 + 0.01 * \sum_{i=1}^{14} P_i$$
Y los **Puntos Función** = $CAF * UFP$

## Arquitectura del Software

La Arquitectura del Software de un sistema es la estructura del sistema que comprende los elementos del software, las **Propiedades Externas Visibles** de tales elementos, y la relacion entre ellas. La arquitectura es el diseño del mas alto nivel, donde se hacen las elecciones de tecnología, productos a utilizar, servidores, etc. Divide al sistema en partes lógicas tal que cada una puede ser **Comprendida Independientemente**, describiendo también la relación entre ellas.

La Arquitectura del Software ayuda a:
* **Comprension y Comunicacion**:
  * Al mostrar la estructura de alto nivel del sistema ocultando su complejidad, facilita la **Comunicación** definiendo un marco de **Comprensión** común entre los interesados siendo de mucha ayuda para las negociaciones, acuerdos y comprensión del sistema existente.
* **Reuso**: 
  * Una forma de **reúso** es componer el sistema con partes existentes, lo cual se facilita si a un alto nivel se reúsan componentes que proveen un servicio completo. Por lo cual se elige una arquitectura tal que las componentes existentes encajen adecuadamente con otras componentes a desarrollar. Estas decisiones sobre el uso de componente se toman en el momento de diseñar la arquitectura.
* **Construccion y Evolucion**: 
  * La división provista por la arquitectura servirá para guiar el desarrollo del sistema. Ayuda a asignar equipos de trabajos a diferentes partes independientes, además de facilitar la elección de cuáles partes necesitas cambiarse durante la **Evolución** del software contribuyendo a decidir cuál es el impacto de dichos cambios.
* **Analisis**:
  * Es deseable que propiedades de **Confiabilidad** y **Desempeño** puedan determinarse en el diseño de alto nivel, permitiendo considerar distintas alternativas de diseño hasta encontrar los niveles de satisfacción deseados. Lo cual requerirá descripción precisa de la arquitectura así como de las propiedades de las componentes.

### La Vista de Componentes y Conectores

Tiene 2 elementos principales, los **Componentes** y los **Conectores**. Esta **Vista** describe qué componentes existen y como interactúan entre ellos en **Tiempo de Ejecución**. Prácticamente es un grafo donde los **componentes son nodos** y los **conectores aristas**.
* **Componentes**: Son unidades de cómputo o de almacenamiento de datos, cada componente tiene un nombre y tipo.
* **Conectores**: Describen el medio en el cual la interacción entre componentes toma lugar. Estos tienen nombre y tipo. Muchas veces estos conectores representan protocolos.

### Estilos Arquitectonicos

Sistemas distintos tienen estructuras CyC (Componentes y conectores) distintas, algunas estructuras son generales y son útiles para una clase de problemas, estos son llamados **Estilos Arquitectónicos**. Un **Estilo Arquitectónico** define una familia de arquitecturas que satisface restricciones de ese estilo. Distintos estilos pueden fusionarse para generar una nueva arquitectura

* ### Tubos y Filtros (*Pipe and Filter*)

Adecuado para sistemas que fundamentalmente realizan **Transformaciones de Datos**. Un sistema que utiliza este estilo usa una red de transformadores para realizar el resultado deseado. Esta compuesto por un solo tipo de componente (**filtro**) y un solo tipo de conector (**tubo**). Un filtro realiza transformaciones y le pasa los datos a otro filtro por un tubo 
<br>Restricciones:

* Un filtro es una entidad independiente y asincrónica.
* Un filtro no necesita saber la identidad de los filtros que envían o reciben datos.
* Un tubo es un canal de redirección unidireccional que transporta un flujo de un filtro a otro.
* Un tubo sólo conecta 2 componentes.
* Lo filtros deben hacer "buffering" y sincronización para asegurar el correcto funcionamiento como productor y consumidor.
* Cada filtro debe trabajar sin conocer la identidad de los filtros productores o consumidores.
* Un tubo debe conectar un puerto de salida de un filtro a un puerto de entrada de otro filtro.
* Un sistema puro de tubos y filtros usualmente requiere que cada filtro tenga su propio hilo de control.

* ### Estilo de Datos Compartido

Hay 2 tipos de componentes, el **Repositorio de Datos** y **Usuario de Datos**. El primero provee almacenamiento permanente confiable, mientras que los usuarios acceden a los datos en el repositorio, realizan cálculos y luego ponen esos datos en el repositorio. De esta forma solo hay 1 tipo de conector de lectura/escritura. Tiene 2 variantes, el estilo pizarra donde cuando hay un cambio en el repositorio se les notifica a todos los usuarios de dicho repositorio, y el estilo repositorio donde el repositorio es pasivo.

* ### Estilo Cliente-Servidor

Hay 2 tipos de componentes, los **Clientes** y los **Servidores**, donde los primeros solo se comunican con el servidor de forma asincrónica, ya que también son los clientes quienes deben iniciar dicha comunicación. El único tipo de conector que hay es *request/reply*. Normalmente este estilo tiene una estructura multi-nivel.

## ATAM

ATAM (*Architecture Tradeoff Analysis Method*)

El ATAM evalúa las consecuencias de las decisiones arquitectónicas en relación a los atributos de calidad. <br>Sus principales pasos son:

1. **Recolectar Escenarios**.
   * Los escenarios describen interacciones del sistema.
   * Elegir los escenarios de interés para el análisis.
   * Incluir escenario excepcionales sólo si son importantes.
2. **Recolectar Requerimientos y/o Restricciones**
   * Definir lo que se espera del sistema en tales escenarios.
   * Deben especificar los niveles deseados para los atributos de interés.
3. **Describir las Vistas Arquitectónicas**
   * Las vistas del sistema que serán evaluadas son recolectadas.
   * Distintas vistas pueden ser necesarias para distintos análisis.
4. **Análisis Especifico a Cada Atributo**
   * Se analizan vistas bajo distintos escenarios separadamente para cada atributo de interés distinto.
   * Esto para comparar los niveles deseados con los obtenidos con cada atributo.
5. **Identificar Puntos Sensitivos y de Compromisos**
   * **Análisis de Sensibilidad**: Ver el impacto de un elemento sobre un atributo de calidad, los que mas afectan los atributos son los puntos de sensibilidad.
   * **Análisis de Compromiso**: Los puntos de compromiso son los elementos que son puntos de sensibilidad para varios atributos.

## Modelo de Proceso de Desarrollo

Un **Modelo de Proceso** especifica un proceso general, usualmente como un conjunto de etapas adecuado para una clase de proyectos, es decir, provee una estructura genérica de los procesos que pueden seguirse en algunos proyectos con el fin de alcanzar sus objetivos.

### Cascada

Tiene 6 faces:
1. Análisis de requerimientos.
2. Diseño de alto nivel.
3. Diseño detallado.
4. Codificación.
5. Testing.
6. Instalación.

Una fase comienza sólo cuando la anterior finaliza, en principio no hay feedback con el cliente ni con otras fases (existe el modelo de cascada con feedback, pero este solo permite el feedback a fases con distancia de uno, es decir, solo con la fase anterior). Normalmente se hace un testing de cada fase antes de pasar a la siguiente para ver que todo ande bien.

Ventajas:
* Conceptualmente simple.
* Intuitivo y lógico.
* Fácil de administrar y ejecutar en un contexto contractual.
* Muy adecuado para proyectos donde los requerimiento son bien comprendidos y las decisiones sobre tecnología son tempranas.
* Es adecuado para proyectos donde los desarrolladores están muy familiarizados con el problema a solucionar y el proceso a seguir.
* Proyectos de corta duración.
* Automatización de procesos manuales existentes.

Desventajas:
* Todo o nada: muy riesgoso.
* Los requisitos se congelan muy temprano (no hay feedback con cliente).
* Puede escoger hardware de tecnologías viejas.
* No permite cambios.
* No hay Feedback con el usuario.

### Prototipo

El prototipo intenta abordar las debilidades de cascada en la especificación de los requerimientos de forma que en vez de construir los requerimiento sólo basado en charlas y debates, se construye un prototipo que permita comprender los requerimientos. Así el cliente tiene mas idea de lo que sería el Software obteniendo mejor feedback de él disminuyendo los riesgos de requerimientos. La etapa de análisis de requerimientos es remplazada por una "mini cascada". El prototipo debe descartarse.
* Construir sólo aspectos que se necesiten aclarar.
* "**Quick and Dirty**": no importa la calidad.
* Omitir manejo de excepciones.
* Reducir testing.

Ventajas:
* Mayor estabilidad en los requerimientos.
* Los requerimientos se congelan mas tarde.
* La experiencia en la construcción del prototipo ayuda al desarrollo principal.
* Sistemas finales mejores y más estables.

Desventajas:
* Potencial impacto en costo y tiempo.
* No permite cambios tardíos.
* Comienzo pesado.

Aplicacion:
* Cuando los requerimientos son difíciles de determinar y la confianza en ellos es baja.
* Sistemas con usuarios novatos.
* Cuando las interfaces con el usuario no son muy importantes.

### Iterativo

Logra abordar el problema del "todo o nada" del modelo de cascada combinando beneficios del Prototipado y del Cascada desarrollando el software incrementalmente, donde cada incremento es completo en si mismo testeando luego de cada uno. Puede verse como una secuencia de cascadas. El feedback de una iteración se puede usar en iteraciones futuras
<br> Primero se crea la **Lista de Control del Proyecto**(**LCP**) la cual contiene en orden las tareas que se deben realizar para lograr la implementación final. Cada iteración consiste en eliminar la siguiente tarea de la lista haciendo diseño, implementación y análisis del sistema parcial y actualizar la LCP, repitiendo este proceso hasta vaciar la lista.

Ventajas:
* Pagos y entregas incrementales.
* Feedback para mejorar desarrollo entre iteraciones.
* Entregas regulares y rápidas.
* Reduce riesgo.
* Prioriza requisitos y acepta cambios.

Desventajas:
* La Arquitectura y el diseño se ven perjudicados.
* La revisión del trabajo hecho puede incrementarse.
* El costo total suele ser mayor.
* Sobrecarga de planeamiento en cada iteración.
* El trabajo de una iteración puede deshacerse en otra.

Aplicaciones:
* Cuando el tiempo de respuesta es importante.
* Cuando no se puede tomar el riesgo de proyectos largos.
* Cuando no se conocen todos los requerimientos.

### Timeboxing

Timeboxing primero fija la duración de las iteraciones y luego determina la especificación, dividiendo la iteración en partes iguales usando *pipelining* para ejecutar iteraciones en paralelo
<br>El desarrollo se realiza iterativamente en "cajas temporizadas" de igual duración, cada una de estas se divide en etapas de duración fijas desarrollando una tarea bien definida independiente a las demás. Hay un equipo en cada etapa. El cronograma tiene un alto compromiso con este modelo.

Ventajas:
* Todas las del iterativo.
* Menor tiempo de entrega.
* Ejecución del proyecto distribuida.
* Planeamiento y negociación un poco más fácil.

Desventajas:
* Grandes equipos de trabajo.
* Administración de proyecto mucho mas compleja.
* Se necesita mucha sincronización.
* Es posible el incremento de los costos.

Aplicacion:
* Cuando los tiempos de entrega son muy importantes.
* Hay flexibilidad en agrupar características.

## Diseño

### Criterio para Evaluar el Diseño

Existen 3 criterios para evaluar el diseño:
* **Correccion**
  * Es fundamental y busca que el diseño sea factible dadas las restricciones y que este implemente todos los requerimientos.
* **Eficiencia**
  * Le compete el uso apropiado de los recursos del sistema. Debido al abaratamiento del hardware no es tan importante como los demás salvo en sistemas muy específicos como sistemas integrados o de tiempo real.
* **Simplicidad**
  * Tiene impacto directo en el mantenimiento, el cual recordemos que es caro. Un diseño simple facilita la comprensión del sistema lo cual hace que el software sea mantenible. Facilita el testing, el descubrimiento y corrección de bugs y la modificación del código.

### Principios Fundamentales del Diseño

Existen Principios fundamentales los cuales nos guían en el proceso del diseño:
* **Partición y jerarquía**
  * Se basa en "divide y conquistarás", trata de dividir el problema en pequeñas partes manejables, donde cada una de estas debe poder solucionarse y modificarse separadamente del resto.
* **Abstraccion**
  * La abstracción de un componente describe el comportamiento externo sin dar detalles de cómo se produce dicho comportamiento, representando a los componentes como cajas negras; lo cual es muy útil para comprender el sistema existente, para el mantenimiento y para determinar el diseño del sistema existente.
* **Modularidad**
  * Un sistema se dice modular si consiste de componentes discretas tal que puedan implementarse separadamente un cambio a una de ellas tenga un mínimo impacto sobre las otras.

### Top-Down y Bottom-Up

* **Top-Down**
  * El diseño comienza con la especificación del sistema.
  * Define el módulo que implementará la especificación.
  * Especifica los módulos subordinados.
  * Luego, iterativamente, trata cada uno de estos módulos especificados cómo el nuevo problema.
  * El refinamiento procede hasta alcanzar un nivel donde el diseño pueda ser implementado directamente
  * **Ventajas**:
    * En cada paso existe una clara imagen del diseño.
    * Enfoque más natural para manipular problemas complejos.
    * La mayoría de las metodologías de diseño se basan en este enfoque
  * **Desventajas**:
    * La factibilidad es desconocida hasta el final.

* **Bottom-Up**:
  * empieza por las componentes básicas de un sistema y prcede a armar cómo las componentes más altas de este las implementan.
  * Cuando dicho sistema se puede/tiene que armar a partir de uno ya existente, del cual se van a utilizar componentes ya armadas.
  * Para poder aplicar bottom-up, se necesita saber a qué sistema de alto nivel se quiere llegar.

### Cohesion y Acoplamiento.

Dos módulos son independientes si cada uno puede funcionar completamente sin la presencia del otro. Esto es deseable ya que ayuda a modificar los módulos y testearlos separadamente. Pero en un sistema no existe la noción de dependencia entre todos los módulos, estos deben cooperar entre si. Mientras mas conexiones hay entre dos módulos, mas dependientes son uno del otro.

**Acoplamiento**: El acoplamiento es un concepto inter-modular que captura esta noción de dependencia. Nuestro objetivo seria tener el menor acoplamiento posible. Siempre que se pueda, tener módulos independientes, ya que este acoplamiento no puede reducirse durante la implementación.
<br>Para tener un bajo acoplamiento se necesitaría que las interfaces sólo contengan información de datos. Mientras que las interfaces que contienen comunicación de información hibrida (datos+ control) tienen mas acoplamiento.

Para mantener esa debilidad y evitar el aumento de acoplamiento, se buscan 3 aspectos en las interfaces de los módulos:
* Minimizar la cantidad en cada uno.
* Pasar parámetros "sencillos".
  * Por ejemplo, no hace falta pasar un objeto entero si solo se quiere modificar uno de sus atributos.
* Pasar parámetros de datos, no de control (Por ejemplo, que no sean variables que se vayan a usar como condición) y, mucho menos, ambos.

**Cohesión**: La cohesión considera caracteriza el vínculo intra-modular. Con esta intentamos capturar cuan cercanamente están relacionados los elementos de un modulo entre sí. Buscamos menor acoplamiento y mayor cohesión.

Niveles de cohesión:
* **Casual**: La relación entre los elementos del módulo no tiene significado per se.
* **Lógico**: Existe alguna relación lógica entre los elementos del módulo. Los elementos realizan acciones dentro de la misma clase lógica.
* **Temporal**: Parecido a cohesión lógica pero los elementos están relacionados en el tiempo y se ejecutan juntos.
* **Procedural**: Contiene elementos que pertenecen a una misma unidad procedural.
* **Comunicacional**: Tiene elementos que están relacionados por una referencia al mismo dato, es decir que están juntos porque operan al mismo dato.
* **Secuencial**: Los elementos están juntos porque la salida de uno corresponde a la entrada del otro.
* **Funcional**: Es la mas fuerte de todas las cohesiones, donde todos los elementos del módulo están relacionados para llevar a cabo una función.

### Diagrama de Estructura

Todo programa tiene estructura, para ello se utiliza el: **Diagrama de Estructura**, el cual presenta una notación gráfica para tal estructura estática del software. Representa módulos y sus interconexiones. Además la invocación de un modulo A a B se representa con una flecha etiquetada con los ítems que se pasan y hacia que lado.

Hay varios tipos de módulos:
* **Módulo de entrada**: Simplemente salen datos desde este módulo hacia el módulo invocador.
* **Módulo de salida**: Simplemente entran datos desde el módulo invocador.
* **Módulo transformador**: Transforma datos enviados por el módulo invocador.
* **Módulo coordinador**: Coordina datos entre módulos invocadores.
* **Módulo compuesto**: Hace todo junto.

### Metodologia de Diseño Estructurado

