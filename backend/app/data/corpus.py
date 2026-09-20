"""
corpus.py
---------
Dataset de demo: artículos cortos y originales sobre programación,
algoritmos y sistemas. Están escritos a mano para este proyecto
(no son texto copiado de ninguna fuente) para poder distribuirlos
libremente en el repo sin problemas de licencia.
"""

from ..index import Document

_RAW_CORPUS = [
    ("Python y el zen de la simplicidad", "general",
     "Python prioriza la legibilidad del código por sobre la brevedad extrema. "
     "Su tipado dinámico y su enorme ecosistema de librerías lo convirtieron en "
     "el lenguaje dominante para ciencia de datos, backend web y scripting."),

    ("Go y la concurrencia con goroutines", "general",
     "Go fue diseñado en Google para compilar rápido y ejecutar programas "
     "concurrentes de forma simple usando goroutines y channels. Es muy usado "
     "para construir herramientas de infraestructura y microservicios."),

    ("Rust y la seguridad de memoria sin garbage collector", "general",
     "Rust garantiza seguridad de memoria en tiempo de compilación mediante su "
     "sistema de ownership y borrowing, evitando data races sin necesidad de "
     "un recolector de basura en tiempo de ejecución."),

    ("JavaScript en el navegador y en el servidor", "general",
     "JavaScript nació para dar interactividad a páginas web y hoy corre también "
     "en servidores gracias a Node.js. Su modelo asíncrono basado en el event "
     "loop permite manejar miles de conexiones concurrentes con pocos recursos."),

    ("Índices invertidos: la base de todo motor de búsqueda", "algoritmos",
     "Un índice invertido mapea cada palabra a la lista de documentos donde "
     "aparece, permitiendo resolver una búsqueda sin recorrer todo el corpus. "
     "Es la estructura de datos central en Lucene, Elasticsearch y Solr."),

    ("TF-IDF: medir la importancia de una palabra", "algoritmos",
     "TF-IDF combina la frecuencia de un término en un documento con la "
     "rareza de ese término en toda la colección, para darle más peso a "
     "palabras distintivas y menos peso a palabras muy comunes."),

    ("BM25: la evolución probabilística de TF-IDF", "algoritmos",
     "BM25 es un modelo de ranking probabilístico que mejora a TF-IDF al "
     "saturar la contribución de términos muy repetidos y normalizar por la "
     "longitud del documento. Es el algoritmo de ranking por defecto en "
     "Elasticsearch."),

    ("Árboles balanceados y búsqueda en O(log n)", "algoritmos",
     "Estructuras como los árboles AVL o rojo-negro mantienen su altura "
     "balanceada tras cada inserción o borrado, garantizando operaciones de "
     "búsqueda, inserción y eliminación en tiempo logarítmico."),

    ("Tablas hash y colisiones", "algoritmos",
     "Una tabla hash ofrece acceso en tiempo promedio constante mapeando "
     "claves a posiciones de un arreglo mediante una función hash. El "
     "manejo de colisiones, por encadenamiento o direccionamiento abierto, "
     "determina su rendimiento en el peor caso."),

    ("Programación dinámica: dividir para optimizar", "algoritmos",
     "La programación dinámica resuelve problemas combinando soluciones de "
     "subproblemas superpuestos, guardando resultados intermedios para "
     "evitar recomputarlos. Es clave en problemas como el de la mochila o "
     "la distancia de edición."),

    ("Bases de datos relacionales y ACID", "bases-de-datos",
     "Las bases de datos relacionales como PostgreSQL garantizan propiedades "
     "ACID: atomicidad, consistencia, aislamiento y durabilidad, lo que las "
     "hace ideales para sistemas transaccionales donde la integridad de los "
     "datos es crítica."),

    ("Bases de datos NoSQL y el teorema CAP", "bases-de-datos",
     "El teorema CAP establece que un sistema distribuido no puede garantizar "
     "simultáneamente consistencia, disponibilidad y tolerancia a particiones. "
     "Bases NoSQL como Cassandra o DynamoDB priorizan disponibilidad sobre "
     "consistencia estricta."),

    ("Índices en bases de datos: B-Trees", "bases-de-datos",
     "La mayoría de los motores de bases de datos relacionales usan B-Trees "
     "para indexar columnas, porque minimizan la cantidad de accesos a disco "
     "necesarios para encontrar una fila, incluso con millones de registros."),

    ("Caching: la optimización más rentable", "sistemas",
     "Agregar una capa de caché, como Redis o Memcached, delante de una "
     "base de datos reduce drásticamente la latencia de lecturas repetidas, "
     "a costa de tener que manejar invalidación y consistencia eventual."),

    ("Sharding: escalar horizontalmente una base de datos", "sistemas",
     "El sharding divide una base de datos en particiones independientes "
     "distribuidas entre varios servidores, permitiendo escalar más allá de "
     "la capacidad de una sola máquina a costa de mayor complejidad en las "
     "consultas que cruzan particiones."),

    ("Replicación y tolerancia a fallos", "sistemas",
     "Replicar datos en varios nodos permite que un sistema siga funcionando "
     "aunque uno de ellos falle. La replicación puede ser síncrona, más "
     "segura pero más lenta, o asíncrona, más rápida pero con riesgo de "
     "pérdida de datos recientes."),

    ("Balanceo de carga entre servidores", "sistemas",
     "Un balanceador de carga distribuye las peticiones entrantes entre "
     "varias instancias de un servicio, usando estrategias como round robin, "
     "menor cantidad de conexiones activas o hashing consistente."),

    ("Contenedores Docker y reproducibilidad", "devops",
     "Docker empaqueta una aplicación junto con todas sus dependencias en una "
     "imagen inmutable, garantizando que el software se comporte igual en "
     "desarrollo, testing y producción."),

    ("Orquestación con Kubernetes", "devops",
     "Kubernetes automatiza el despliegue, escalado y recuperación de "
     "aplicaciones en contenedores, reiniciando automáticamente instancias "
     "que fallan y ajustando la cantidad de réplicas según la carga."),

    ("Integración continua y despliegue continuo (CI/CD)", "devops",
     "Un pipeline de CI/CD ejecuta automáticamente tests y despliega código "
     "nuevo cada vez que se sube un cambio, reduciendo el riesgo de errores "
     "humanos y acelerando el ciclo de entrega de software."),

    ("Observabilidad: logs, métricas y traces", "devops",
     "La observabilidad moderna combina logs estructurados, métricas "
     "numéricas y trazas distribuidas para entender qué está pasando dentro "
     "de un sistema en producción sin tener que adivinar."),

    ("Arquitectura de microservicios", "arquitectura",
     "Dividir un sistema en microservicios permite que distintos equipos "
     "desarrollen, desplieguen y escalen partes de la aplicación de forma "
     "independiente, a costa de mayor complejidad operativa y de red."),

    ("Monolitos: no siempre son el enemigo", "arquitectura",
     "Un monolito bien estructurado, con módulos claros y bajo acoplamiento, "
     "puede ser más simple de operar y más rápido de desarrollar que un "
     "sistema de microservicios prematuro."),

    ("Colas de mensajes y arquitectura orientada a eventos", "arquitectura",
     "Sistemas como Kafka o RabbitMQ permiten desacoplar servicios: uno "
     "publica eventos y otros los consumen a su propio ritmo, mejorando la "
     "resiliencia ante picos de tráfico."),

    ("REST vs GraphQL: dos formas de diseñar APIs", "arquitectura",
     "REST organiza la API alrededor de recursos y verbos HTTP, mientras "
     "que GraphQL permite al cliente pedir exactamente los campos que "
     "necesita en una sola consulta, evitando el over-fetching típico de "
     "REST."),

    ("Autenticación con JWT", "seguridad",
     "Un JSON Web Token permite autenticar peticiones sin que el servidor "
     "guarde estado de sesión, ya que el propio token contiene la "
     "información firmada digitalmente para verificar su autenticidad."),

    ("Encriptación simétrica y asimétrica", "seguridad",
     "La encriptación simétrica usa la misma clave para cifrar y descifrar, "
     "siendo muy rápida, mientras que la asimétrica usa un par de claves "
     "pública y privada, ideal para intercambiar claves de forma segura."),

    ("Ataques de inyección SQL y cómo prevenirlos", "seguridad",
     "Un ataque de inyección SQL ocurre cuando un input del usuario se "
     "concatena directamente en una consulta. Usar consultas parametrizadas "
     "o un ORM elimina prácticamente por completo este riesgo."),

    ("Machine learning: aprendizaje supervisado", "ml",
     "En el aprendizaje supervisado, un modelo aprende a partir de ejemplos "
     "etiquetados, ajustando sus parámetros para minimizar el error entre "
     "sus predicciones y las etiquetas reales."),

    ("Embeddings y búsqueda semántica", "ml",
     "Un embedding representa una palabra o documento como un vector "
     "numérico en un espacio donde elementos con significado similar quedan "
     "cerca entre sí, permitiendo búsquedas por similitud de significado y "
     "no solo por coincidencia exacta de palabras."),

    ("Redes neuronales y descenso de gradiente", "ml",
     "Una red neuronal ajusta sus pesos internos mediante descenso de "
     "gradiente, moviéndose iterativamente en la dirección que reduce la "
     "función de pérdida sobre los datos de entrenamiento."),

    ("Complejidad algorítmica: notación Big O", "algoritmos",
     "La notación Big O describe cómo crece el tiempo de ejecución o el uso "
     "de memoria de un algoritmo a medida que crece el tamaño de la entrada, "
     "permitiendo comparar algoritmos sin depender del hardware."),

    ("Algoritmos de ordenamiento: quicksort vs mergesort", "algoritmos",
     "Quicksort suele ser más rápido en la práctica gracias a su buena "
     "localidad de memoria, mientras que mergesort garantiza O(n log n) "
     "en el peor caso y es estable, preservando el orden relativo de "
     "elementos iguales."),

    ("Grafos: BFS y DFS", "algoritmos",
     "El recorrido en anchura (BFS) explora un grafo nivel por nivel y es "
     "ideal para encontrar el camino más corto en grafos no ponderados, "
     "mientras que el recorrido en profundidad (DFS) explora tan lejos como "
     "sea posible antes de retroceder."),

    ("El patrón de diseño Singleton", "patrones",
     "El patrón Singleton garantiza que una clase tenga una única instancia "
     "accesible globalmente. Es útil para recursos compartidos como un pool "
     "de conexiones, aunque su abuso puede introducir estado global oculto "
     "difícil de testear."),

    ("Inyección de dependencias", "patrones",
     "La inyección de dependencias desacopla una clase de la creación de "
     "sus dependencias, recibiéndolas desde afuera. Esto facilita escribir "
     "tests unitarios reemplazando dependencias reales por mocks."),

    ("Testing: unitarios, de integración y end-to-end", "testing",
     "Los tests unitarios verifican una unidad de código aislada, los de "
     "integración verifican que varios componentes funcionen juntos, y los "
     "end-to-end simulan el flujo completo de un usuario real sobre el "
     "sistema desplegado."),

    ("Test-Driven Development (TDD)", "testing",
     "TDD propone escribir primero un test que falla, luego el código "
     "mínimo necesario para que pase, y finalmente refactorizar. El "
     "resultado es una suite de tests que crece junto con el código de "
     "forma natural."),

    ("HTTP/2 y multiplexado de conexiones", "redes",
     "HTTP/2 permite enviar múltiples peticiones y respuestas en paralelo "
     "sobre una única conexión TCP, eliminando el problema de "
     "head-of-line blocking a nivel de aplicación que tenía HTTP/1.1."),

    ("DNS: cómo se resuelve un nombre de dominio", "redes",
     "Cuando escribís una URL, el navegador consulta servidores DNS en "
     "cascada, desde los servidores raíz hasta los autoritativos del "
     "dominio, hasta obtener la dirección IP correspondiente."),

    ("CDN: acercar el contenido al usuario", "redes",
     "Una red de distribución de contenido cachea archivos estáticos en "
     "servidores repartidos geográficamente, reduciendo la latencia al "
     "servir el contenido desde el nodo más cercano al usuario final."),

    ("El modelo de concurrencia de Node.js", "sistemas",
     "Node.js usa un único hilo principal con un event loop no bloqueante, "
     "delegando operaciones de I/O a un pool de threads en segundo plano, "
     "lo que le permite manejar miles de conexiones simultáneas sin crear "
     "un thread por cada una."),

    ("Transacciones distribuidas y el protocolo two-phase commit", "sistemas",
     "El two-phase commit coordina que varios nodos confirmen o cancelen "
     "una transacción de forma atómica, aunque introduce un punto único de "
     "coordinación que puede bloquear al sistema si el coordinador falla."),

    ("Rate limiting: proteger una API de abuso", "seguridad",
     "Limitar la cantidad de peticiones que un cliente puede hacer en una "
     "ventana de tiempo, mediante algoritmos como token bucket o sliding "
     "window, protege una API de abuso y de picos de tráfico inesperados."),
]


def load_corpus() -> list[Document]:
    return [
        Document(doc_id=i, title=title, text=text, category=category)
        for i, (title, category, text) in enumerate(_RAW_CORPUS, start=1)
    ]
