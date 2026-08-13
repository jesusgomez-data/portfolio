import subprocess

cwd = r"c:\Users\jesus\Documents\AntiGravity\Portfolio"
r1 = subprocess.run(["git", "add", "."], cwd=cwd, capture_output=True, text=True)
print("ADD STDOUT:", r1.stdout)
print("ADD STDERR:", r1.stderr)

r2 = subprocess.run(["git", "commit", "-m", "Actualizacion CV: redisenio PDF para reclutadores y cambio de dominio a jgstudio.dev"], cwd=cwd, capture_output=True, text=True)
print("COMMIT STDOUT:", r2.stdout)
print("COMMIT STDERR:", r2.stderr)

r3 = subprocess.run(["git", "push"], cwd=cwd, capture_output=True, text=True)
print("PUSH STDOUT:", r3.stdout)
print("PUSH STDERR:", r3.stderr)
