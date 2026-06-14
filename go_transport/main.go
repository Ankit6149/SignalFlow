package main

import (
    "context"
    "encoding/json"
    "fmt"
    "math"
    "math/rand"
    "net/http"
    "time"
)

var rng = rand.New(rand.NewSource(time.Now().UnixNano()))

func jitterDuration(baseSeconds, mu float64) time.Duration {
    r := rng.Float64()
    delay := baseSeconds + mu*math.Log(1-r)
    if delay < 0 {
        delay = baseSeconds
    }
    return time.Duration(delay * float64(time.Second))
}

func publishHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        w.WriteHeader(http.StatusMethodNotAllowed)
        fmt.Fprintln(w, "Method not allowed")
        return
    }

    type payload struct {
        Target  string `json:"target"`
        Content string `json:"content"`
    }

    var body payload
    if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
        w.WriteHeader(http.StatusBadRequest)
        fmt.Fprintln(w, "invalid payload")
        return
    }

    time.Sleep(jitterDuration(1.5, 0.9))

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]any{
        "status":  "ok",
        "target":  body.Target,
        "message": "queued",
    })
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintln(w, "ok")
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/health", healthHandler)
    mux.HandleFunc("/publish", publishHandler)

    srv := &http.Server{
        Addr: ":8081",
        Handler: mux,
        ReadTimeout: 10 * time.Second,
        WriteTimeout: 15 * time.Second,
        IdleTimeout: 30 * time.Second,
    }

    go func() {
        <-context.Background().Done()
        srv.Shutdown(context.Background())
    }()

    fmt.Println("go_transport listening on :8081")
    if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
        fmt.Println("server error:", err)
    }
}
