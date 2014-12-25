module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		uglify: {
			options: {
				banner: "/*\n frontend powered By Startan\n Designed By xiang\n producted By fei\n */\n",
				mangle: true
			},
			build: {
				files: [{
					expand: true,
					cwd: "src/js",
					src: "*.js",
					dest: "static/js"
				}]
			}
		},
		jshint: {
			all: "src/js/*.js"
		},
		ejs: {
		  	all: {
		  	  	options: {
		   		   	version: "src"
		    	},
			    src: "./*.ejs.html",
			    dest: '.',
			    expand: true,
		    	ext: '.html'
		  	}, 
		  	ejs_release: {
  	  	  	  	options: {
  	  	   		   	version: "static"
  	  	    	},
  	  		    src: "./*.ejs.html",
  	  		    dest: '.',
  	  		    expand: true,
  	  	    	ext: '.html'
		  	}
		},
		tinypng: {
			options: {
				apiKey: "HqlNT6ZmW9hkPvug8ImntRrEj5f4yuBi",
				checkSigs: true,
				sigFile: "src/img/sig.json",
				summarize: true,
				stopOnImageError: false
			},
			build: {
				files: [{
					expand: true,
					src: ["*.png", "**/*.png"],
					cwd: "src/img",
					dest: "static/img"
				}]
			}
		},
		cssmin: {
			options: {
				banner: "/*\n Frontended By Startan\n Designed By Nini\n */\n",
				keepSpecialComments: 0
			},
			build: {
				files: [{
					expand: true,
					cwd: "src/css",
					src: "*.css",
					dest: "static/css"
				}]
			}

		}
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-tinypng');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-ejs');
	grunt.registerTask('default', ['uglify', "cssmin", 'tinypng', 'ejs:all']);
	grunt.registerTask('release', ['uglify', "cssmin", 'tinypng', 'ejs:ejs_release']);
};
