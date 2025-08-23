# Wingman CRM - Flujo de Desarrollo con Claude Code

## Configuración MCP (Model Control Protocol)

### 1. Browser MCP
- **Navigate**: `mcp__browser__navigate`
- **Screenshot**: `mcp__browser__take_screenshot`  
- **Snapshot**: `mcp__browser__snapshot`
- **Click**: `mcp__browser__click`
- **Type**: `mcp__browser__type`
- **Wait**: `mcp__browser__wait_for`

### 2. Supabase MCP
- **Proyecto Wingman**: `mcp__supabase-wingman__*` (proyecto correcto)
- **Proyecto Normal**: `mcp__supabase__*` (evitar usar este)
- **URL del proyecto**: https://aidonaqkdbnlvdtgksrv.supabase.co

### 3. Windows Logs MCP
- **Leer logs actuales**: `mcp__windows-logs__read_windows_logs`
- **Verificar estado de la app**: `mcp__windows-logs__get_app_status`
- **Iniciar monitoreo**: `mcp__windows-logs__start_log_monitoring`

## Flujo de Testing Completo

### 1. Preparar Datos de Prueba
```bash
# Verificar proyecto correcto
mcp__supabase-wingman__get_project_url

# Agregar comerciales de prueba
mcp__supabase-wingman__execute_sql
INSERT INTO comercial (nombre, email, telefono, activo, ...) VALUES (...)

# Agregar leads de prueba  
INSERT INTO lead (source, nombre_contacto, etapa, ...) VALUES (...)

# Agregar eventos de prueba
INSERT INTO evento (bar_id, comercial_id, titulo, fecha, ...) VALUES (...)
```

### 2. Testing con Browser
```bash
# Iniciar servidor de desarrollo
npm run dev  # Corre en puerto 3000

# Navegar a páginas
mcp__browser__navigate
- http://localhost:3000/admin/comerciales
- http://localhost:3000/admin/reportes  
- http://localhost:3000/comercial/reportes

# Verificar que los datos se muestren correctamente
mcp__browser__snapshot  # Analizar DOM
mcp__browser__take_screenshot  # Captura visual
```

### 4. Debug con Multiple Logging Systems

#### Dev Logger (Navegador → Terminal)
- **Archivo**: `app/dev-logger.tsx`
- **API**: `app/api/dev-logs/route.ts`
- **Uso**: Los `console.log()` del navegador aparecen en la terminal de `npm run dev`

#### Windows Logs MCP (Terminal → Claude)
```bash
# Leer logs actuales del servidor npm run dev
mcp__windows-logs__read_windows_logs

# Verificar si npm run dev está corriendo
mcp__windows-logs__get_app_status

# Monitorear logs en tiempo real
mcp__windows-logs__start_log_monitoring
```

### 4. Limpieza
```bash
# Eliminar datos de prueba después del testing
DELETE FROM evento WHERE titulo = 'Test Event';
DELETE FROM lead WHERE nombre_contacto = 'Test Lead';  
DELETE FROM comercial WHERE email = 'test@example.com';
```

## Estructura de Base de Datos Wingman

### Comerciales
- **Tabla**: `comercial`
- **Campos importantes**: `id`, `nombre`, `email`, `telefono`, `activo` (boolean), `created_at`

### Leads  
- **Tabla**: `lead`
- **Campos importantes**: `id`, `source` (WEBFORM), `etapa` (PROSPECTO), `nombre_contacto`

### Eventos
- **Tabla**: `evento`  
- **Campos importantes**: `id`, `bar_id` (requerido), `comercial_id` (requerido), `titulo`, `fecha`

### Bares
- **Tabla**: `bars`
- **Uso**: Para obtener `bar_id` para eventos

## Flujo de Debug Completo

### Paso 1: Verificar Estado del Servidor
```bash
mcp__windows-logs__get_app_status  # Ver si npm run dev está corriendo
```

### Paso 2: Navegar y Reproducir Issue  
```bash
mcp__browser__navigate → http://localhost:3000/admin/comerciales
mcp__browser__snapshot  # Ver estado del DOM
```

### Paso 3: Leer Logs en Tiempo Real
```bash
mcp__windows-logs__read_windows_logs        # Logs actuales
mcp__windows-logs__start_log_monitoring     # Monitoreo continuo
```

### Paso 4: Verificar Datos en BD
```bash
mcp__supabase-wingman__execute_sql  # Consultar datos directamente
```

## Comandos de Testing

### Verificar Datos
```sql
-- Contar registros
SELECT COUNT(*) FROM comercial;
SELECT COUNT(*) FROM lead;
SELECT COUNT(*) FROM evento;

-- Ver datos recientes
SELECT * FROM comercial ORDER BY created_at DESC LIMIT 5;
```

### Debugging Common Issues
1. **"No se encontraron comerciales"**: Verificar paginación y filtros
2. **Count correcto pero sin tarjetas**: Problema en el mapping de datos
3. **Proyecto incorrecto**: Asegurar usar `mcp__supabase-wingman__*`

## Estado Actual del Proyecto

- ✅ Datos de prueba agregados a proyecto wingman
- ✅ Browser MCP configurado y funcionando
- ✅ Dev logger activo para debugging
- 🔄 Testing páginas de comerciales, reportes, y funcionalidad de paginación
- ⏳ Pendiente: Limpieza de datos de prueba

## Notas Importantes

- Siempre usar el MCP `supabase-wingman` para este proyecto
- El servidor corre en puerto 3000 por defecto
- Los logs del navegador aparecen automáticamente en la terminal de desarrollo
- Las capturas de browser muestran el estado real de la interfaz