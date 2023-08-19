package main

import (
	"context"
	"embed"
	"io/fs"
	"log"
	"net/http"

	"github.com/a-wing/lightcable"
	"github.com/caarlos0/env/v9"
)

//go:embed dist
var dist embed.FS

type config struct {
	Listen string `env:"LISTEN" envDefault:"0.0.0.0:8080"`
}

func main() {
	cfg := config{}
	if err := env.Parse(&cfg); err != nil {
		log.Panicf("%+v\n", err)
	}

	fsys, err := fs.Sub(dist, "dist")
	if err != nil {
		log.Fatal(err)
	}

	server := lightcable.New(lightcable.DefaultConfig)
	server.OnRoomReady(func(room string) {
		log.Printf("Room Ready: %s", room)
	})
	server.OnRoomClose(func(room string) {
		log.Printf("Room Close: %s", room)
	})
	server.OnConnReady(func(c *lightcable.Client) {
		log.Printf("Room: %s, Conn Ready: %s", c.Room, c.Name)
	})
	server.OnConnClose(func(c *lightcable.Client) {
		log.Printf("Room: %s, Conn Close: %s", c.Room, c.Name)
	})
	server.OnMessage(func(m *lightcable.Message) {
		log.Printf("Room: %s, Conn: %s, Data: %s, Code: %d", m.Room, m.Name, m.Data, m.Code)
	})
	go server.Run(context.Background())

	http.Handle("/", http.FileServer(http.FS(fsys)))
	http.Handle("/socket", server)
	log.Println("Listen address:", cfg.Listen)
	log.Fatal(http.ListenAndServe(cfg.Listen, nil))
}
