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

