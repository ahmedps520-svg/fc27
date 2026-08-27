# Manager model (optional)

Drop a glTF binary at `assets/manager.glb` and Manager Career loads it in
place of the built suit figure: scaled to ~1.85m, stood in the technical area,
first animation clip looping as the idle.

The file is fetched on demand during a career match and is deliberately NOT in
the service worker's precache (a 30MB+ model has no business in the offline
bundle for people who never open Career).

Getting a large file into the repo: the GitHub web uploader stops at 25MB, but
an ordinary `git push` takes files up to 100MB — or hand the file's download
URL to whoever maintains this repo and they can commit it.
