#!/usr/bin/env python3
"""
start_services.py

This script allows you to start either Supabase, local AI services, or both.
Both stacks use the same Docker Compose project name ("localai")
so they appear together in Docker Desktop.
"""

import os
import subprocess
import shutil
import time
import argparse

def run_command(cmd, cwd=None, check=True):
    """Run a shell command and print it."""
    print("Running:", " ".join(cmd))
    try:
        result = subprocess.run(cmd, cwd=cwd, check=check)
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"Command failed: {e}")
        if check:
            raise
        return False

def clone_supabase_repo():
    """Clone the Supabase repository using sparse checkout if not already present."""
    if not os.path.exists("supabase"):
        print("Cloning the Supabase repository...")
        run_command([
            "git", "clone", "--filter=blob:none", "--no-checkout",
            "https://github.com/supabase/supabase.git"
        ])
        os.chdir("supabase")
        run_command(["git", "sparse-checkout", "init", "--cone"])
        run_command(["git", "sparse-checkout", "set", "docker"])
        run_command(["git", "checkout", "master"])
        os.chdir("..")
    else:
        print("Supabase repository already exists, updating...")
        os.chdir("supabase")
        run_command(["git", "pull"])
        os.chdir("..")

def prepare_supabase_env():
    """Copy .env to .env in supabase/docker."""
    env_path = os.path.join("supabase", "docker", ".env")
    env_example_path = os.path.join(".env")
    if os.path.exists(env_example_path):
        print("Copying .env in root to .env in supabase/docker...")
        shutil.copyfile(env_example_path, env_path)
    else:
        print("Warning: .env file not found in the root directory. Supabase might not work correctly.")

def stop_existing_containers(components):
    """Stop and remove existing containers for specified components."""
    compose_files = []
    
    if "supabase" in components:
        compose_files.append("-f")
        compose_files.append("supabase/docker/docker-compose.yml")
    
    if "localai" in components:
        compose_files.append("-f")
        compose_files.append("docker-compose.yml")
    
    if not compose_files:
        print("No components selected to stop.")
        return
    
    print(f"Stopping and removing existing containers for components: {', '.join(components)}...")
    try:
        # First check if Docker is running and accessible
        run_command(["docker", "ps"], check=False)
        
        # Then try to stop the containers
        cmd = ["docker", "compose", "-p", "localai"] + compose_files + ["down"]
        run_command(cmd, check=False)
        print("Successfully stopped existing containers or none were running.")
    except Exception as e:
        print(f"Warning: Couldn't stop existing containers: {e}")
        print("Continuing with startup anyway...")

def start_supabase():
    """Start the Supabase services (using its compose file)."""
    print("Starting Supabase services...")
    return run_command([
        "docker", "compose", "-p", "localai", "-f", "supabase/docker/docker-compose.yml", "up", "-d"
    ], check=False)

def start_local_ai(profile=None):
    """Start the local AI services (using its compose file)."""
    print("Starting local AI services...")
    cmd = ["docker", "compose", "-p", "localai"]
    if profile and profile != "none":
        cmd.extend(["--profile", profile])
    cmd.extend(["-f", "docker-compose.yml", "up", "-d"])
    return run_command(cmd, check=False)

def main():
    parser = argparse.ArgumentParser(description='Start the local AI and/or Supabase services.')
    parser.add_argument('--profile', choices=['cpu', 'gpu-nvidia', 'gpu-amd', 'none'], default='cpu',
                      help='Profile to use for Docker Compose (default: cpu)')
    parser.add_argument('--components', choices=['all', 'supabase', 'localai'], default='all',
                      help='Components to start (default: all)')
    args = parser.parse_args()
    
    # Determine which components to start
    start_all = args.components == 'all'
    start_supabase_flag = start_all or args.components == 'supabase'
    start_localai_flag = start_all or args.components == 'localai'
    
    # Prepare components to stop
    components_to_stop = []
    if start_supabase_flag:
        components_to_stop.append("supabase")
        clone_supabase_repo()
        prepare_supabase_env()
    if start_localai_flag:
        components_to_stop.append("localai")
    
    # Stop existing containers for selected components
    stop_existing_containers(components_to_stop)
    
    # Start selected components
    if start_supabase_flag:
        supabase_success = start_supabase()
        if supabase_success and start_localai_flag:
            # Give Supabase some time to initialize before starting local AI
            print("Waiting for Supabase to initialize...")
            time.sleep(10)
    
    if start_localai_flag:
        start_local_ai(args.profile)
    
    print(f"Startup complete for selected components: {args.components}")

if __name__ == "__main__":
    main()
