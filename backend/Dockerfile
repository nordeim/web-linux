# =============================================================================
# UbuntuOS Web — Hardened Terminal Container
# =============================================================================
# This image provides a minimal, non-root Ubuntu environment for the
# Real Terminal feature. It is intentionally bare: no sudo, no compilers,
# no unnecessary packages. The container runs with:
#   --read-only --cap-drop=ALL --network=none -u 1000:1000
# =============================================================================

FROM ubuntu:24.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install minimal packages required for a functional terminal
# - bash: shell
# - coreutils: ls, cat, mkdir, etc.
# - curl/wget: removed (no network in default config)
# - vim-tiny: minimal editor (optional, can be removed for smaller image)
# - locales: UTF-8 support
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        bash \
        coreutils \
        locales \
        procps \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Generate UTF-8 locale for proper terminal encoding
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && \
    locale-gen
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

# Remove sudo entirely (security hardening)
RUN apt-get purge -y sudo 2>/dev/null || true && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user with uid 1000 (matches docker.ts User: '1000:1000')
# Remove the default ubuntu user if it exists (ubuntu:24.04 creates it with uid 1000)
RUN if id -u ubuntu >/dev/null 2>&1; then userdel -r ubuntu || true; fi && \
    if getent group ubuntu >/dev/null 2>&1; then groupdel ubuntu || true; fi && \
    groupadd -g 1000 appuser && \
    useradd -u 1000 -g appuser -m -s /bin/bash appuser

# Set working directory to user's home
WORKDIR /home/appuser

# Switch to non-root user
USER 1000:1000

# Default command (overridden by docker.ts Cmd: ['bash'])
CMD ["/bin/bash"]
