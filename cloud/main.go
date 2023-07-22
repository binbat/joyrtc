package main

import (
	"context"
	"embed"
	"flag"
	"io/fs"
	"log"
	"net/http"

	"github.com/a-wing/lightcable"
)

//go:embed dist
var dist embed.FS

func main() {
	address := flag.String("l", "0.0.0.0:8080", "set server listen address and port")
	help := flag.Bool("h", false, "this help")
	flag.Parse()

	if *help {
		flag.Usage()
		return
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
	log.Println("Listen address:", *address)
	log.Fatal(http.ListenAndServe(*address, nil))
}
