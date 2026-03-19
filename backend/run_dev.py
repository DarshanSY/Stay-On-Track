from app import create_app

if __name__ == '__main__':
    app = create_app()
    print("Starting test server on port 5001...")
    # Disable reloader to avoid child process issues in this context if possible, or keep it.
    app.run(debug=True, port=5001, host='0.0.0.0', use_reloader=False)
