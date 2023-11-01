//go:build release

package main

import (
	"embed"
	"io/fs"
	"log"
)

//go:embed dist
var build embed.FS

var dist fs.FS

func init() {
	var err error
	dist, err = fs.Sub(build, "dist")
	if err != nil {
		log.Fatal(err)
	}
}
