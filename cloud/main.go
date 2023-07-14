package main

import (
	"context"
	"flag"
	"log"
	"net/http"

	"github.com/a-wing/lightcable"
)

func main() {
	address := flag.String("l", "0.0.0.0:8080", "set server listen address and port")
	help := flag.Bool("h", false, "this help")
	flag.Parse()

	if *help {
		flag.Usage()
		return
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

	log.Println("Listen address:", *address)
	log.Fatal(http.ListenAndServe(*address, server))
}
