# Setup Monitoring

Este projeto tem suporte a utilizão de uma stack completa de observabilidade com Prometheus, Jaeger, Sentry e os caraio a 4 para monitoramento, tracing distribuído e tracking de erros.


## Configuração Inicial

### 1. Iniciar os serviços

Os arquivos de config estão dentro de `etc/` e no `compose.monitoring.yaml` para iniciar os serviços de monitoramento pode ser direto pelo docker-compose:

```bash
# Subir todos os serviços em background
docker compose --file compose.monitoring.yaml up --detach

# Verificar se todos os containers estão rodando
docker-compose ps

# ou pelo lazydocker que é amis legal

lazydocker
```

ou usar as tarefas via npm para sua comodidade:

```bash
npm run start:monitoring

# para parar

npm run stop:monitoring
```

### 2. Configuração inicial do Sentry

⚠️ **Importante**: O Sentry requer uma configuração inicial na primeira execução.

```bash
# 1. Executar migrações do banco de dados
docker-compose exec sentry sentry upgrade --noinput

# 2. Criar usuário administrador
docker-compose exec sentry sentry createuser

# 3. Reiniciar os serviços do Sentry
docker-compose restart sentry sentry-worker sentry-cron
```

Durante a criação do usuário, você será solicitado a fornecer:
- Email do administrador
- Senha
- Confirmação se é superusuário (responda 'y')

## Acessos aos Serviços

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **Prometheus** | http://localhost:9090 | - |
| **Jaeger UI** | http://localhost:16686 | - |
| **Sentry** | http://localhost:9000 | Criadas no setup inicial |
| **Grafana** | http://localhost:3000 | admin / admin |

## Comandos Úteis

### Visualizar logs dos serviços
```bash
# Logs de todos os serviços
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs -f sentry
docker-compose logs -f prometheus
docker-compose logs -f jaeger
```

### Reiniciar serviços específicos
```bash
docker-compose restart sentry
docker-compose restart prometheus
```

## Configurações Adicionais

### Prometheus
Edite o arquivo `etc/prometheus/prometheus.yml` para adicionar novos targets de monitoramento:

```yaml
scrape_configs:
  - job_name: 'minha-aplicacao'
    static_configs:
      - targets: ['localhost:8080']
```

### Sentry - Configurações de Produção

Para ambientes de produção, certifique-se de:

1. **Alterar a secret key** no `docker-compose.yml`:

```yaml
environment:
  SENTRY_SECRET_KEY: 'sua-chave-secreta-segura-aqui'
```

2. **Configurar email** (opcional) adicionando variáveis de ambiente:
```yaml
environment:
  SENTRY_EMAIL_HOST: 'smtp.seu-provedor.com'
  SENTRY_EMAIL_PORT: 587
  SENTRY_EMAIL_USER: 'seu-email@dominio.com'
  SENTRY_EMAIL_PASSWORD: 'sua-senha'
```

## Troubleshooting

### Sentry não inicia corretamente

```bash
# Verificar logs do Sentry
docker compose --file compose.monitoring.yaml logs sentry

# Recriar e reiniciar containers do Sentry
docker compose --file compose.monitoring.yaml stop sentry sentry-worker sentry-cron
docker compose --file compose.monitoring.yaml rm sentry sentry-worker sentry-cron
docker compose --file compose.monitoring.yaml up -d sentry sentry-worker sentry-cron
```

### Problema de permissões nos volumes

```bash
# Limpar volumes e recriar
docker compose --file compose.monitoring.yaml down -v
docker compose --file compose.monitoring.yaml up -d --build
# Refazer configuração inicial do Sentry
```

### Verificar saúde dos serviços

```bash
# Status detalhado
docker compose ps

# Verificar se as portas estão abertas
netstat -tlnp | grep -E "(9090|16686|9000|3000)"
```
