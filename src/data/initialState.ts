import { Message, MemoryNode, TelemetryStats, AegisAuditEntry, Rule, ArchitectureFile } from '../types';

export const ANDROID_ARCHITECTURE_MODULES: ArchitectureFile[] = [
  {
    id: 'arch-1',
    name: 'MainViewModel.kt',
    layer: 'Presentation',
    path: 'app/src/main/java/com/example/uru/presentation/MainViewModel.kt',
    code: `class MainViewModel(
  private val enviarConsultaUseCase: EnviarConsultaUseCase,
  private val getContadorUseCase: GetContadorUseCase
) : ViewModel() {
  private val _state = MutableStateFlow<MainState>(MainState.Initial)
  val state: StateFlow<MainState> = _state.asStateFlow()

  fun enviarConsulta(mensaje: String) {
    viewModelScope.launch {
      _state.value = MainState.Loading
      try {
        val respuesta = enviarConsultaUseCase(mensaje)
        _state.value = MainState.Success(respuesta)
      } catch (e: Exception) {
        _state.value = MainState.Error(e.message ?: "Error desconocido")
      }
    }
  }
}`
  },
  {
    id: 'arch-2',
    name: 'EnviarConsultaUseCase.kt',
    layer: 'Domain',
    path: 'app/src/main/java/com/example/uru/domain/usecase/EnviarConsultaUseCase.kt',
    code: `class EnviarConsultaUseCase(
  private val repository: ConsultaRepository
) : UseCase<String, String> {
  override suspend fun invoke(input: String): String {
    require(input.isNotBlank()) { "El mensaje no puede estar vacío" }
    return repository.enviarConsulta(input)
  }
}`
  },
  {
    id: 'arch-3',
    name: 'ConsultaRepository.kt',
    layer: 'Data',
    path: 'app/src/main/java/com/example/uru/data/repository/ConsultaRepositoryImpl.kt',
    code: `@Singleton
class ConsultaRepositoryImpl @Inject constructor(
  private val remoteDataSource: RemoteDataSource,
  private val localDataSource: LocalDataSource
) : ConsultaRepository {
  override suspend fun enviarConsulta(mensaje: String): String {
    return try {
      val respuesta = remoteDataSource.enviarConsulta(mensaje)
      localDataSource.guardarConsulta(mensaje, respuesta)
      respuesta
    } catch (e: Exception) {
      localDataSource.obtenerUltimaConsulta() ?: throw e
    }
  }
}`
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-init-1',
    role: 'assistant',
    content: '🔥 URU Personal AI Middleware iniciado. Listo para procesar eventos autónomos y consultas cognitivas. ¿Cómo puedo asistirte hoy?',
    timestamp: new Date().toISOString(),
    mode: 'autonomous',
    auditSignature: 'sha256_genesis_block',
    latencyMs: 0.001
  }
];

export const INITIAL_MEMORIES: MemoryNode[] = [
  {
    id: 'mem-init-1',
    type: 'context',
    content: 'Sistema URU inicializado en modo autónomo',
    importance: 95,
    timestamp: new Date().toISOString(),
    tags: ['sistema', 'boot', 'crítico']
  }
];

export const INITIAL_STATS: TelemetryStats = {
  totalTokens: 0,
  requestsCount: 0,
  eventsProcessed: 0,
  averageLatencyMs: 0.08,
  neuralLoad: 25,
  activeMemoryNodes: 1,
  autonomousStepsRun: 0,
  contextWindowSize: 8192,
  modelVersion: 'gemini-pro'
};

export const INITIAL_NEW_BORN_STATE = {
  trustLevel: 42,
  cautionLevel: 58,
  verificationDueInSeconds: 1800,
  lastVerificationTime: Date.now(),
  protocolActive: true,
  connectionKeyword: 'AEGIS_PROTOCOL'
};

export const INITIAL_AUDIT_LOGS: AegisAuditEntry[] = [
  {
    id: 'audit_genesis',
    timestamp: Date.now(),
    actor: 'system_bootstrap',
    action: 'INIT',
    topic: 'system.boot',
    payload: { version: '2.0.0', mode: 'autonomous' },
    riskScore: 0,
    riskLevel: 'NONE',
    approved: true,
    signature: 'sha256_genesis_hash',
    previousHash: 'none',
    chainValid: true
  }
];

export const INITIAL_RULES: Rule[] = [
  {
    id: 'rule-1',
    name: 'Verificación de Contexto',
    condition: 'context.trustLevel > 50',
    action: 'ALLOW_AUTONOMOUS',
    priority: 'HIGH',
    enabled: true
  },
  {
    id: 'rule-2',
    name: 'Límite de Tokens',
    condition: 'tokens.used < tokens.limit',
    action: 'CONTINUE',
    priority: 'HIGH',
    enabled: true
  },
  {
    id: 'rule-3',
    name: 'Protección AEGIS',
    condition: 'audit.chainValid === true',
    action: 'MAINTAIN_AUDIT',
    priority: 'CRITICAL',
    enabled: true
  }
];
