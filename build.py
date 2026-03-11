import pty
import os
import sys
import select

def run_build():
    pid, fd = pty.fork()
    if pid == 0:
        # Child process
        os.environ["PATH"] += ":/usr/local/bin"
        os.execlp("npx", "npx", "eas-cli", "build", "-p", "android", "--profile", "preview")
    else:
        # Parent process
        try:
            while True:
                r, w, e = select.select([fd], [], [], 0.5)
                if fd in r:
                    data = os.read(fd, 4096)
                    if not data:
                        break
                    sys.stdout.buffer.write(data)
                    sys.stdout.buffer.flush()
                    if b"Generate a new Android Keystore?" in data:
                        print("\n[Auto-Script] Found keystore prompt. Answering 'Y'.")
                        os.write(fd, b"Y\n")
        except OSError:
            pass
        _, status = os.waitpid(pid, 0)
        print("\n[Auto-Script] Process exited with status:", os.waitstatus_to_exitcode(status))

if __name__ == "__main__":
    print("[Auto-Script] Starting EAS Build via PTY...")
    run_build()
