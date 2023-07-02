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
	go server.Run(context.Background())

	log.Println("Listen address:", *address)
	log.Fatal(http.ListenAndServe(*address, server))
}
