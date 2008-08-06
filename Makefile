# By default, we expect to be in a directory structure like <EXTENSION
# NAME>/<BRANCH> (e.g. sameplace/devel) and retrieve name and branch
# from there.  You can hardcode these if you want.

NAME=$(shell basename $(shell readlink -f ..))
BRANCH=$(shell basename $(shell pwd))

# Modify domain and URLs to suit yourself here

EXTID=$(NAME)@hamen.org
#UPDATE_URL=http://hamen.homelinux.org:443/$(NAME)/$(BRANCH)/update.rdf
#XPI_URL=http://hamen.homelinux.org/$(NAME)/$(BRANCH)/$(NAME)-$(BRANCH).xpi

UPDATE_URL=http://hamen.homelinux.org/notifyme/devel/update.rdf
XPI_URL=http://hamen.homelinux.org/notifyme/devel/notifyme-devel.xpi
 

# Path for spock (http://hyperstruct.net/projects/spock)

SIGN=/usr/local/share/spock/spock -d /home/ivan/secdir -i urn:mozilla:extension:$(EXTID) -v $(VERSION)  -u $(XPI_URL) -f $(FILE)

# Latest darcs tag (if any) and build date will get appended to filename

#TAG=$(shell if [ -d _darcs ]; then darcs changes | grep '^  tagged ' | sed 's/  tagged //' | head -1; else echo 0.0.0; fi)
BUILD=$(shell date -u +%Y%m%d%H)
ifdef TAG
VERSION=$(TAG).$(BUILD)
else
VERSION=$(BUILD)
endif
ADDMO=0
FILE=$(NAME)-$(BRANCH)-$(VERSION).xpi
XML_EDIT=xmlstarlet ed \
	-N 'rdf=http://www.w3.org/1999/02/22-rdf-syntax-ns\#' \
	-N 'em=http://www.mozilla.org/2004/em-rdf\#'

######################################################################
# Targets

release: clean $(FILE)
	darcs dist -d $(NAME)-$(BRANCH)
	ln -sf $(FILE) $(NAME)-$(BRANCH).xpi
	$(SIGN) update.rdf.template >update.rdf

xpi: $(FILE)

$(FILE):
	mkdir dist dist/chrome
	cd chrome && zip -y -r ../dist/chrome/$(NAME).jar . -x \*/lab/\*
	sed -e 's|chrome/|jar:chrome/$(NAME).jar!/|g' chrome.manifest >dist/chrome.manifest
ifeq ($(ADDMO),1)
	$(XML_EDIT) -u '//em:version' -v $(VERSION) -d '//em:updateURL' \
		install.rdf >dist/install.rdf 
else
	$(XML_EDIT) -u '//em:version' -v $(VERSION) -u '//em:updateURL' -v $(UPDATE_URL) \
		install.rdf >dist/install.rdf 
endif
	cp -a defaults dist
	-cp -a components dist
	-cp -a platform dist
	cd dist && zip -r ../$(FILE) *
	rm -rf dist

clean:
	rm -rf dist *.xpi update.rdf

.PHONY: xpi release clean
