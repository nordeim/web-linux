6 of 7 items from the remediation plan were fully implemented and verified:
1. ✅ Stale comments fixed (AppRouter.tsx, registry.ts)
2. ✅ Real ScreenRecorder implemented (getDisplayMedia + MediaRecorder)
3. ✅ MINIMIZE_ALL tests added (3 tests in osReducer-minimizeAll.test.ts)
4. ✅ Critical disconnect() bug fixed in websocket.ts
5. ✅ Phase 3 security infrastructure created AND integrated (types.ts, logger.ts, policy.ts now wired into websocket.ts)
6. ✅ Client heartbeat added to RealTerminal.tsx
7. ⚠️ Custom Dockerfile - Not yet implemented (remaining recommendation)
The one remaining item from status_24.md (custom Dockerfile for Real Terminal) is listed as a recommendation in the "Known Issues & Recommendations" section.

Now I have a complete understanding of the situation. Let me create a comprehensive implementation plan for the Dockerfile.  
  
The planning documents specify:  
- Phase 3, Task 3.4: "Harden Docker container image: create custom Dockerfile based on ubuntu:24.04 with non-root user, minimal packages, no sudo"  
- Success criteria: "Image builds; container runs as uid 1000"  
  
Current state:  
- docker.ts uses process.env.DOCKER_IMAGE ?? 'ubuntu:24.04'  
- Container runs with User: '1000:1000'  
- Container has ReadonlyRootfs: true, Tmpfs: { '/tmp': 'size=100m' }, CapDrop: ['ALL'], etc.  
  
The Dockerfile should:  
1. Be based on ubuntu:24.04  
2. Create a non-root user (uid 1000)  
3. Remove sudo  
4. Minimize packages  
5. Set up a proper shell environment  
6. Be ready for PTY attachment  
  
Let me create a detailed plan.  

Now I have all the context. Let me create a comprehensive implementation plan for the Dockerfile.  
  
────────────────────────────────────────────────────────────────────────────────  
  
Dockerfile Implementation Plan — RealTerminal Container Hardening  
  
Executive Summary  
  
The RealTerminal feature currently uses the stock ubuntu:24.04 image. The original planning documents (Phase 3, Task 3.4) specify creating a custom hardened Dockerfile. This plan details the implementation.  
  
Current State:  
- docker.ts line 49: Image: process.env.DOCKER_IMAGE ?? 'ubuntu:24.04'  
- Container runs as User: '1000:1000'  
- Container has: ReadonlyRootfs: true, CapDrop: ['ALL'], NetworkMode: 'none'  
  
Gap: No custom Dockerfile exists. The stock ubuntu:24.04 image includes sudo, unnecessary packages, and no pre-configured non-root user.  
  
────────────────────────────────────────────────────────────────────────────────  
  
Plan Validation Against Planning Documents  
  
┌────────────────────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬──────────────────────────────────────────────────────┐  
│ Plan Reference                                 │ Requirement                                                                                                                   │ Status                                               │  
├────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────┤  
│ plan_xterm.md Phase 3 Task 3.4                 │ "Create custom Dockerfile based on ubuntu:24.04 with non-root user, minimal packages, no sudo"                                │ ❌ Not implemented                                   │  
├────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────┤  
│ Validated_Implementation_Plan Phase 3 Task 3.4 │ "Harden Docker container image: create custom Dockerfile based on ubuntu:24.04 with non-root user, minimal packages, no sudo" │ ❌ Not implemented                                   │  
├────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────┤  
│ Success Criteria                               │ "Image builds; container runs as uid 1000"                                                                                    │ ⚠ Partially met (runs as 1000 but from stock image) │  
└────────────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────┘  
  
────────────────────────────────────────────────────────────────────────────────  
  
Implementation Specification  
  
### File Location  
  
```  
  backend/Dockerfile  
```  
  
### Design Decisions  
  
┌───────────────────┬─────────────────────────────┬────────────────────────────────────────┐  
│ Decision          │ Choice                      │ Rationale                              │  
├───────────────────┼─────────────────────────────┼────────────────────────────────────────┤  
│ Base image        │ ubuntu:24.04                │ Matches config.ts default DOCKER_IMAGE │  
├───────────────────┼─────────────────────────────┼────────────────────────────────────────┤  
│ Non-root user     │ appuser:1000 with 1000:1000 │ Matches docker.ts User: '1000:1000'    │  
├───────────────────┼─────────────────────────────┼────────────────────────────────────────┤  
│ Shell             │ /bin/bash                   │ Matches docker.ts Cmd: ['bash']        │  
├───────────────────┼─────────────────────────────┼────────────────────────────────────────┤  
│ Package removal   │ Remove sudo, apt-utils      │ Security hardening                     │  
├───────────────────┼─────────────────────────────┼────────────────────────────────────────┤  
│ Locale            │ Set en_US.UTF-8             │ Proper terminal encoding               │  
├───────────────────┼─────────────────────────────┼────────────────────────────────────────┤  
│ Working directory │ /home/appuser               │ Non-root home directory                │  
└───────────────────┴─────────────────────────────┴────────────────────────────────────────┘  
  
### Dockerfile Content  
  
```dockerfile  
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
  RUN apt-get purge -y sudo && \  
      rm -rf /var/lib/apt/lists/*  
  
  # Create non-root user with uid 1000 (matches docker.ts User: '1000:1000')  
  RUN groupadd -g 1000 appuser && \  
      useradd -u 1000 -g appuser -m -s /bin/bash appuser  
  
  # Set working directory to user's home  
  WORKDIR /home/appuser  
  
  # Switch to non-root user  
  USER 1000:1000  
  
  # Default command (overridden by docker.ts Cmd: ['bash'])  
  CMD ["/bin/bash"]  
```  
  
### Configuration Updates Required  
  
#### 1. backend/src/config.ts — Add DOCKER_IMAGE default  
  
```typescript  
  DOCKER_IMAGE: z.string().default('ubuntuos-terminal:latest'),  
```  
  
#### 2. backend/src/docker.ts — No changes needed  
  
The existing Image: process.env.DOCKER_IMAGE ?? 'ubuntu:24.04' will automatically use the custom image when DOCKER_IMAGE env var is set.  
  
#### 3. backend/package.json — Add build script  
  
```json  
  {  
    "scripts": {  
      "docker:build": "docker build -t ubuntuos-terminal:latest .",  
      "docker:test": "docker run --rm ubuntuos-terminal:latest echo 'Image OK'"  
    }  
  }  
```  
  
────────────────────────────────────────────────────────────────────────────────  
  
Validation Checklist  
  
┌───┬────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────┐  
│ # │ Criterion                  │ How to Verify                                                                     │  
├───┼────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────┤  
│ 1 │ Image builds successfully  │ docker build -t ubuntuos-terminal:latest backend/                                 │  
├───┼────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────┤  
│ 2 │ Container runs as uid 1000 │ docker run --rm ubuntuos-terminal:latest id → uid=1000(appuser) gid=1000(appuser) │  
├───┼────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────┤  
│ 3 │ No sudo available          │ docker run --rm ubuntuos-terminal:latest which sudo → exit code 1                 │  
├───┼────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────┤  
│ 4 │ bash shell works           │ docker run --rm ubuntuos-terminal:latest bash -c 'echo OK' → "OK"                 │  
├───┼────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────┤  
│ 5 │ UTF-8 locale               │ docker run --rm ubuntuos-terminal:latest locale → LANG=en_US.UTF-8                │  
├───┼────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────┤  
│ 6 │ Minimal image size         │ docker images ubuntuos-terminal → < 150MB (stock ubuntu:24.04 is ~77MB)           │  
├───┼────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────┤  
│ 7 │ Core utilities work        │ docker run --rm ubuntuos-terminal:latest ls /bin → shows coreutils                │  
├───┼────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────┤  
│ 8 │ Process listing works      │ docker run --rm ubuntuos-terminal:latest ps aux → works (procps installed)        │  
└───┴────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────┘  
  
────────────────────────────────────────────────────────────────────────────────  
  
Integration Test  
  
After creating the Dockerfile, update docker.ts to use the custom image by default:  
  
```typescript  
  Image: process.env.DOCKER_IMAGE ?? 'ubuntuos-terminal:latest',  
```  
  
Then run the existing backend tests to ensure nothing breaks:  
  
```bash  
  cd backend && npm test  
```  
  
────────────────────────────────────────────────────────────────────────────────  
  
Security Benefits  
  
┌───────────────────────────────────┬─────────────────────────────┐  
│ Before (stock ubuntu:24.04)       │ After (custom image)        │  
├───────────────────────────────────┼─────────────────────────────┤  
│ sudo available                    │ sudo removed                │  
├───────────────────────────────────┼─────────────────────────────┤  
│ ~77MB base + unnecessary packages │ Minimal packages only       │  
├───────────────────────────────────┼─────────────────────────────┤  
│ No UTF-8 locale configured        │ UTF-8 locale pre-configured │  
├───────────────────────────────────┼─────────────────────────────┤  
│ Root user exists                  │ Only appuser (uid 1000)     │  
├───────────────────────────────────┼─────────────────────────────┤  
│ No working directory set          │ /home/appuser               │  
└───────────────────────────────────┴─────────────────────────────┘  
  
────────────────────────────────────────────────────────────────────────────────  
  
Risk Assessment  
  
┌────────────────────────────────────────┬─────────────┬────────┬─────────────────────────────────────────────────────────────────────┐  
│ Risk                                   │ Probability │ Impact │ Mitigation                                                          │  
├────────────────────────────────────────┼─────────────┼────────┼─────────────────────────────────────────────────────────────────────┤  
│ Missing package causes command failure │ Low         │ Medium │ coreutils covers most basic commands; procps covers ps              │  
├────────────────────────────────────────┼─────────────┼────────┼─────────────────────────────────────────────────────────────────────┤  
│ Locale issues with special characters  │ Low         │ Low    │ UTF-8 locale explicitly configured                                  │  
├────────────────────────────────────────┼─────────────┼────────┼─────────────────────────────────────────────────────────────────────┤  
│ Image size increase                    │ Low         │ Low    │ Minimal packages; --no-install-recommends                           │  
├────────────────────────────────────────┼─────────────┼────────┼─────────────────────────────────────────────────────────────────────┤  
│ Breaking existing tests                │ Very Low    │ Low    │ Tests use docker.test.ts which only checks flags, not image content │  
└────────────────────────────────────────┴─────────────┴────────┴─────────────────────────────────────────────────────────────────────┘  
  
────────────────────────────────────────────────────────────────────────────────  
  
Files to Create/Modify  
  
┌───────────────────────┬────────┬─────────────────────────────────────────────────────────┐  
│ File                  │ Action │ Change                                                  │  
├───────────────────────┼────────┼─────────────────────────────────────────────────────────┤  
│ backend/Dockerfile    │ Create │ New hardened Dockerfile                                 │  
├───────────────────────┼────────┼─────────────────────────────────────────────────────────┤  
│ backend/src/config.ts │ Modify │ Change default DOCKER_IMAGE to ubuntuos-terminal:latest │  
├───────────────────────┼────────┼─────────────────────────────────────────────────────────┤  
│ backend/package.json  │ Modify │ Add docker:build and docker:test scripts                │  
├───────────────────────┼────────┼─────────────────────────────────────────────────────────┤  
│ README.md             │ Modify │ Add Docker build instructions                           │  
└───────────────────────┴────────┴─────────────────────────────────────────────────────────┘  
  
────────────────────────────────────────────────────────────────────────────────  
  
Effort Estimate  
  
┌──────────────────────┬────────────┐  
│ Task                 │ Time       │  
├──────────────────────┼────────────┤  
│ Create Dockerfile    │ 15 minutes │  
├──────────────────────┼────────────┤  
│ Update config.ts     │ 5 minutes  │  
├──────────────────────┼────────────┤  
│ Update package.json  │ 5 minutes  │  
├──────────────────────┼────────────┤  
│ Build and test image │ 10 minutes │  
├──────────────────────┼────────────┤  
│ Update README        │ 10 minutes │  
├──────────────────────┼────────────┤  
│ Total                │ 45 minutes │  
└──────────────────────┴────────────┘  
  
────────────────────────────────────────────────────────────────────────────────  
  
Recommendation  
  
Approved to proceed. The Dockerfile is a straightforward hardening step that completes Phase 3, Task 3.4 from the original planning documents. The implementation is low-risk and high-value, removing sudo and unnecessary packages from  
the terminal container.  
  
Next steps after approval:  
1. Create backend/Dockerfile  
2. Update backend/src/config.ts default image name  
3. Add docker scripts to backend/package.json  
4. Build and verify the image  
5. Run full test suite to confirm no regressions

