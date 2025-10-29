```
## Planeamiento

- Las 3 fases del proceso para la administracion de proyectos entran
- COCOMO se re toma: Saber como explicar el insoso A) Obtener el estimador inicial, lo de sistema organico, semi-rigido y rigido y de los factores fk saber 2. Saber las formulas. Saber explicar porque ahi una tabla para cada tipo de sistema (Tabla de la parte D Calcula el estimador de esfuerzo de cada fase)
- Para 3,4,5 Frasesita ¿Ques es? ¿Para que sirve?
- Para la 6 (Administracion de riesgos) se toma el cuadro de la pag 44 con explicacion de sus partes
1. Principales medidas y las frasesitas de ¿Que es?¿Para que sirve?

## Testing

TODO

- Sobre criterio toma ejemplos o definicion
- No toma niveles de testing, pero si las “otras formas de testing” ((pag 72)
- No toma vida de un error
```

# Diseño Detallado

## PDL

El PDL es un lenguaje que idealmente se desea que:

1. Sea tan preciso como sea posible.
2. No requiera un nivel de datalle excesivo.
3. Sea independiente del lenguaje de implementacion final.
4. Pueda convertirse facilmente en codigo durante la fase de implementacion.

### Caracteristicas

* Tiene la sintaxis externa de un lenguaje de programacion estructurado, pero el vocabulario de un lenguaje natural.
* Captura la logica completa del procedimiento, pero revela pocos detalles de la implementacion.
* El diseño puede expresarse en el nivel de detalle mas adecuado para el problema.

### Ventajas y Desventajas

| Ventajas | Desventajas |
|---|---|
| Se puede integrar con el código fuente, facilitando su mantenimiento. | No es capaz de expresar la funcionalidad de una manera comprensible. |
| Permite la declaración tanto de datos como de procedimientos. | La notación es comprensible para personas con manejo de PDL. |
| Es una forma barata y efectiva de modificar la arquitectura. | |

### Enfoque de Refinamiento Sucesivo

El enfoque de refinamiento sucesivo, tambien conocido como refinamiento paso a paso, es el metodo mas comun para diseñar la logica/algoritmo.

* PDL permite un enfoque de refinamiento sucesivo.
* PDL es particularmente util conjuntamente con la tecnica de refinamiento top-down

El desarrollo se realiza gradualmente:
1. Comenzar por convertir la especificacion del modulo en una descripcion abstracta del algoritmo.
2. En cada paso, descomponer una o mas sentencias del algoritmo actual en instrucciones mas detalladas.
3. Terminar cuando todas las instrucciones son lo suficientemente precisas como para llevarlas facilmente al lenguaje de programacion.

## Verificacion

El **Objetivo** de la verificacion es mostrar que el diseño detallado cumple con las especificaciones dadas en el diseño del sistema.

Existen **3 Metodos de Verificacion**:
1. **Recorrido del Diseño**: Basicamente, es una reunion informal entre el diseñador y el lider, u otros diseñadores, donde el autor explica el diseño paso a paso a las otras personas.
2. **Revision Critica del Diseño**: Se aplica si el diseño se realiza en PDL o algun lenguaje formal. Asegura consistencia automaticamente. Es posible mayor detalle, dependiendo (de la formalidad) del lenguaje.
3. **Verificadores de Consistencia**: Sigue un proceso de revision estandar. Es importante el uso de listas de control.

## Metricas

Las metricas tradicionalmente destinadas al codigo son tambien utiles en el diseño detallado.

Algunas metricas son:
1. **Complejidad ciclomatica**:
   * **Mide la complejidad de un modulo**.
   * Depende de las condiciones y sentencias de control.
   * A medida que estas aumentan, la complejidad aumenta.
2. **Vinculos de Datos**:
   * Los distintos modulos estan vinculados por los datos que se pasan en las invocaciones (estos vinculos determinan el acoplamiento).
   * Esta metrica **capturan la interaccion de datos entre las distintas porciones del software**.
3. **Metrica de cohesion**:
   * **Mide la dependencia de los distintos elementos del modulo**. 
   * El valor sera mas alto si cada ejecucion posible del modulo usa todos los recursos (variables) del modulo.

---

# Codificacion

## Programacion Estructurada

El **Objetivo** de la Programacion Estructurada es simplificar la estructura de los programas de manera que sea facil de razon sobre ellos.

### Estatica vs. Dinamica

* Un programa tiene una estructura **Estatica** la cual es el orden de las sentencias en el codigo, el cual es un orden lineal.
* Un programa tiene una estructura **Dinamica** que es el orden el cual las sentencias se ejecutan.

Por lo que cada estructura define un orden en las sentencias.

Para mostrar que un programa es correcto, debemo mostar que el comportamiento dinamico es el esperado, pero debemos razonar sobre la estructura estatica. O sea la justificacion del comportamiento de un programa se realiza sobre el codigo estatico.

El Objetivo de la Programacion Estructurada: Escribir programas cuya estructura dinamica es la misma que la estatica, o sea las sentencias se ejecutan en el mismo orden que las presenta el codigo. Como las sentencias se organizan linealmente (estatico), el objetivo es desarrollar programas cuyo flujo de control (dinamico) es lineal.

### Constructores

Los constructores de la programacion estructurada son de una **Unica Entrada** y una **Unica Salida**. De esta manera, la ejecucion de las sentencias se realizan en el orden en el que aparecen en el codigo, por lo que el orden Dinamico y el Estatico son lo mismo. Entonces: La Programacion Estructurada **Simplifica** el flujo de control, facilitando en consecuencia tanto la **Comprension** de los programas asi como el **Razonamiento** (formal o informal) sobre estos
<br>Los constructores no pueden ser arbitrarios, ellos deben mostrar un comportamiento claro.

## Procesos de Codificacion

La codificacion comienza cuando esta disponible la especificacion del diseño de los modulos. Usualmente los modulos se asignan a programadores individuales.
<br>Desarrollo top-down => los modulo de los niveles superiores se desarrollan primero.
<br>Desarrollo bottom-up => los modulos de los niveles inferiores se desarrollan primero.

Para la codificacion se pueden utilizar distintos procesos. Procesos Basicos:
* Escribir Codigo del modulo.
* Realizar Test de Unidad.
* Si error: Arreglar bugs y repetir tests.

### Proceso de Codificacion Incremental

```
        Specification of the module
                    |
                    v
+-> Write some code to implement some functionality
|                   |
|                   v
|   Tests old and new functionalities
|                   |
|                   v
|         +---------------------+
| +-----> | Run the test script |
| |       +---------------------+
| |                 |
| |                 v
| |            +---------+
| |            | Errors? |
| |            +---------+
| |             /      \
| |           Yes       No
| |           /           \
| |      +-------+     +--------------------+
| |      |  Fix  |     | All specs covered? |
| |      +-------+     +--------------------+
| |          |               /        \
| |          |              No         Yes
| |          |              |           |
| +----------+              |           v
|                           |          Exit
+---------------------------+
```

1. El proceso comienza con la **Especificacion del Modulo**, o sea definir que debe hacer esa parte del sistema. En esta etapa se determina los requisitos y funcionalidades que el modulo debe cumplir.
2. Con la especificacion lista, el desarrollador **escribe una parte del codigo** que implemente una o varias funcionalidades del modulo.
3. Una vez que se escribe el codigo, se **preparan o ejecutan pruebas** (tests) que verifican:
   * Que las nuevas funcionalidades funcionen correctamente.
   * Que las funcionalidades anteriores sigan funcionando.
4. Se **ejecutan los scripts de prueba** automatizados para validar el codigo. Esto incluye pruebas unitarias, de integracion o de sistema, segun la etapa de desarrollo.
5. Aca se **verifica si el test detecto errores**:
   * **Si** hay errores: Se corrigen y luego se vuelven a ejecutar los scripts de prueba.
   * **NO** hay errores: Significa que los test se ejecutaron correctamente, por lo que se continua con la siguiente etapa.
6. Cuando ya no hay mas errores, se **evalua si todas las especificaciones del modulo estan cubiertas**:
   * **Si** estan cubiertas: El modulo cumple todos los requisitos -> se finaliza el proceso (exit).
   * **No** estan cubiertas: Todavia faltan partes por implementar -> se vuelve a la fase 2 (Write some code ...) para seguir desarrollando.

### Desarrollo Dirigido por Test

TDD (Test Driven Development): 
* Este proceso de codificacion cambia el orden de las actividades en la codificacion con respecto al clasico. 
* El programador primero escribe los escripts para los test y luego el codigo para que estos pasen los casos de tests en el script.
* Se realiza incrementalmente.
* Ayuda a asegurar que todo el codigo es testeable.
* Se enfoca en como sera usado el codigo a desarrollar.
* La Completitud del codigo depende de cuan exhaustivo sean los casos de test.
* El codigo necesitara refactorizcion para mejorar el codigo.

### Programacion de a Pares

* El codigo se escribe por dos programadores en lugar de uno solo:
  * Ambos programadores diseñan los algoritmos, estructuras de datos, estrategias, etc.
  * Una persona tipea el codigo, la otra revisa activamente el codigo que se tipea.
  * Se señalan los errores y conjuntamente formulan soluciones.
  * Los roles se alternan periodicamente.
* La revision de codigo es continua.
* Te da un mejor diseño de algoritmos/estructuras de datos/logica/...
* Es mas dificil que se escapen las condiciones particulares.

## Refactorizacion!!

La **Refactorizacion** es la tarea que permite realizar cambios en un programa con el fin de simplificarlo y mejorar su comprension, o sea hacerlo testeable y mantenible, sin cambiar el comportamiento observacional de este.
* **La estructura interna del software cambia**.
* **El comportamiento externo permanece igual**.

El **objetivo** basico es de mejorar el diseño en el codigo. No es el mismo que mejorar el diseño durante el proceso de diseño. La Refactorizacion se aplica a codigo que ya esta funcionando por lo que no tiene como objetivo corregir bugs

La Refactorizacion intenta **lograr** las siguientes cosas:
* Reducir Acomplamiento.
* Incrementar Cohesion.
* Mejorar respuesta al principio abierto-cerrado.

La Refactorizacion se realiza durante la codificacion y generalmente esta asociada a un requerimiento de cambio.

### Malores Olores

Los **Malos Olores** son signos faciles de localizar en el codigo que indican la posible necesidad de refactorizacion.
* No garantiza que sea realmente necesario.
* Se necesita hacer analisis caso por caso.
* Codigo duplicado (La misma funcionalidad aparece en lugares distintos).
* Metodos largos (Podria estar tratando de hacer demasiadas cosas).
* Clases Gramdes (Puede estar encapsulando muchos conceptos).

### Refactorizaciones Mas Comunes

Para Mejorar el diseño se enfocan en:
- Metodos.
- Clases.
- Jerarquia de clases.

#### Mejoras de Metodos

* Extracciones de metodos.
* Agregar/Eliminar parametros.

#### Mejoras de Clases

* Desplazamiento de metodos.
* Desplazamiento de atributos.
* Extraccion de clases.
* Reemplazar valores de datos por objetos.

#### Mejoras de Jerarquias

* Reemplazar condicionales con polimorfismo.
* Subir metodos/atributos.

## Verificacion

### Testing de Unidad

Es un testing que solo se **enfoca en el modulo escrito por un programador**. Usualmente, el test de unidad (TU) lo realiza el mismo programador. 
<br>Requiere casos de test para el modulo. Tambien requiere la escritura de "drivers" que ejecuten el modulo con los casos de test. 
<br>Si se realiza codificacion incremental, entonces el TU completo necesita automatizarse. Si no seria demasiado tedioso la ejecucion rpetida de los TU.

### Analisis estatico

# Proceso de Software

## Enfoque ETVX (*Entry* - *Task* - *Verification* - *Exit*)

* **Criterio de entrada**: Que condiciones deben cumplirse para iniciar la fase.
* **Tarea**: Lo que debe realizar la fase.
* **Verificacion**: Las inspecciones/controles/revisiones/verificaciones que deben realizarse a la salida de la fase, o sea al producto de trabajo.
* **Criterio de salida**: Cuando puede considerarse que la fase fue realizada exitosamente.

Cada fase produce informacion para la administracion de procesos.

## 0. Proceso de Desarrollo

Tenemos como objetivo construir sistemas de software dentro de los costos y el tiempo planeado, cronograma, y que posea la calidad apropiada, satisfaciendo al cleinte, con alta C&P.

El proceso de Desarrollo es un conjunto de fases, donde cada fase es a su vez una secuencia de pasos que definen la metologia de la fase. ¿Para que utilizar fases?
* Para dividir y conquitar, osea dividir el problema en subproblemas mas pequeños
* Cada fase ataca distintas partes del problema.
* Y ayuda a validar continuamente el proyecto.

Esta compuesto por las siguientes actividades:
* Analisis de requerimiento y especificacion.
  * **Objetivo**: Comprender precisamente el problema
  * Forma la base del acuerdo entre el cliente y el desarrollador.
  * Especifica el "que" y no el "como".
  * La especificacion de requerimientos de sistemas medianos pueden extenderse cientos de paginas.
  * **Salida** (producto de trabajo): Especificacion de los requerimientos del software (SRS).
* Arquitectura y Diseño.
  * Diseño:
    * Es el paso fundamental para moverse del dominio del problema al dominio de la solucion.
    * Involucra 3 tareas:
      * **Diseño Arquitectonico**: Establece las componentes y conectores que conforman el sistema.
      * **Diseño de Alto Nivel**: Establece los modulos y estructuras de datos necesarios para implementar la arquitectura.
      * **Diseño Detallado**: Establece la logica de los modulos.
    * **Salida**: Documentos Correspondientes
* Codificacion.
  * **Objetivo**: Implementar el diseño con codigo simple y facil de comprender (Legible).
  * La fase de codificacion afecta tanto al testing como al mantenimiento. Codigo bien escrito puede reducir el esfuerzo de testing y de mantenimiento.
  * **Salida**: El codigo.
* Testing.
  * **Objetivo**: Identificar la mayoria de los defectos.
  * Es una tarea muy cara, por lo que debe planearse y ejecutarse apropiadamente.
  * **Salida**: Plan de test conjuntamente con los resultados, y el codigo final testeado, y confiable.
* Entrega e instalacion.

## 1. Proceso de Administracion del Proyecto

Fases:
* Planeamiento.
* Seguimiento y Control.
* Analisis de Terminacion.

**Planeamiento**: Se realiza antes de comenzar el proyecto, es la actividad principal que produce un plan el cual forma la base del siguimiento.

### Seguimiento y control
* Acompaña al proceso de desarrollo
* Tareas:
  * Seguir y observar parametros claves como costos, tiempos, riesgo, asi como los factores que los afectan.
  * Tomar accion correctiva si es necesario.
* Las metricas proveen la informacion del proceso de desarrollo necesaria para el seguimiento.

### Analisis de terminacion
* Se realiza al finalizar el proceso de desarrollo.
* El proposito fundamental es analizar el desempeño del proceso e identificar las lecciones aprendidas.
* En procesos iterativos el analisis de terminacion se realiza al finalizar cada iteracion y se usa para mejorar en iteraciones siguientes.

## 2. Proceso de Inspeccion

Objetivo: Detectar los defectos en los productos de trabajo.

Es utilizado en todos los tipos de productos de trabajo. Mejora tanto la calidad como la productividad. La inspeccion pueden realizarse sobre cualquier documento, incluidos requerimientos, diseño y planificacion.

```
Producto de 
trabajo a revisar
      |
      |
      V
 Planeamiento
      |
      |  Cronograma, equipo de
      |  revision e invitacion
      V
Preparacion y
repaso
      |
      |  Registro de defectos,
      |  Recomendaciones
      V
Reunion de 
revicion grupal
      |
      |  Producto de trabajo
      |  revisado, resumen y reporte
      V
Correccion y
seguimiento
```

Es un proceso estructurado con roles definidos para cada participante: moderador, autor, revisor, lector y escriba.
<br>Tiene el foco en encontrar problemas, no en resolverlos. La informacion recolectada en la revision es registrada y utilizada para monitorear la efectividad de la solucion.

### Roles y Responsabilidades

* **Moderador**: Tiene la responsabilidad general. Asegura que el foco permanezca sobre la identificacion de defectos y evita que se prolonguen o discutan soluciones. Garantiza que la reunion se ejecute ordenada y amigablemente.
* **Autor**: Quien realizo el producto de trabajo.
* **Revisor**: Quien identifica los defectos.
* **Lector**: Lee linea a linea el producto de trabajo para enfocar el progreso de la reunion.
* **Escriba**: Registra las observaciones indicadas.

### Planeamiento

* Selecciona el equipo de revision.
* Identifica al moderador, tendra la responsabilidad principal en la inspeccion.
* Prepara el paquete para la distribucion:
  * El producto de trabajo a revisar.
  * Las especificaciones del producto de trabajo.
  * Listas de control con items relevantes.
  * Estandares.

### Preparacion y Repaso Previo (*overview*)

* Breve reunion (es opcional): 
  * Se entrega el paquete.
  * Se explica el proposito de la revision.
  * Se da una breve intro señalando areas de cuidado.
* En esta etapa los miembros del equipo revisan individualemente el producto de trabajo:
  * Identifican defectos potenciales en registros individuales; se usan listas de control (*checklist*), pautas y estandares.
* No deberia durar mas de 2 horas y se debe hacer de corrido.

### Reunion de Revision Grupal

**Proposito**: Definir la lista final de defectos

**Criterio de Entrada**: Cada miembro debe haber hecho apropiadamente la revision individual, el moderador revisa los registros individuales.

La reunion:
* El lector lee linea a linea el producto de trabajo o cualquier otra pequeña unidad.
* En cualquier linea, cualquier observacion que hubiere, preparada o nueva, es efectuada.
* Se sigue una discusion para identificar el defecto.
* La decision es registrada por el escriba.

### Al final de la Reunion

* El escriba presenta la lista de defectos/observaciones.
* Si hay pocos defectos el producto de trabajo se acepta, si no, se puede requerir otra revision.
* El grupo no propone soluciones, aunque podrian registrarse sugerencias.
* Se prepara un resumen de la inspeccion, se usa para evaluar la efectividad de la revision.

### Correccion y Seguimiento

* Los defectos en la lista de defectos son posteriormente corregidos por el autor.
* Una vez corregidos, el autor obtiene el visto bueno del moderador o el producto de trabajo se somete a una nueva revision.
* Una vez que los defectos/observaciones fueron satisfactoriamente procesados, la revision finaliza.

## 3. Proceso de Administracion de Configuracion

La administracion de configuracion (SCM) controla sistematicamente los cambios producidos. Se enfoca en los cambios durante la evolucion; los cambios de requerimiento se manejan aparte.

## 4. Proceso de Administracion de Cambios de Requisitos

Los requerimientos pueden cambiar en cualquier momento durante el desarrollo
* Los cambios producen impacto en los productos de trabajo y en los distintos items de configuracion.
* Los cambios no controlados pueden impactar en el proyecto, tanto en costo como en tiempo.
* Los cambios deben permitirse, pero siempre de manera controlada.

### El proceso

* Registrar los cambios
* Realizar analisis de impacto sobre el producto de trabajo y los items
* Estimar el impacto en esfuerzo y en cronograma.
* Analizar el impacto con las personas involucradas.
* Reprocesar los productos de trabajo y los items.

Los cambios se inician a traves de un requerimiento de cambio.
* Existe un registro de requerimientos de cambio
* El analisis de impacto para un requerimiento de cambio incluye identificar los cambios necesarios en los distintos items y la naturaleza del cambio.
* El impacto del cambio en el proyecto es analizado para decidir si hacer efectivo o no.
* Los cambios acumulados tambien se registran.