IDLC=/home/ivan/code/gecko-sdk/bin/xpidl
INC=/home/ivan/code/gecko-sdk/idl
XPTS=XMPPPresenceNotificationService.xpt

all: $(XPTS)

%.xpt: %.idl
	$(IDLC) -m typelib -w -v -I $(INC) -e $(@) $(<)

.PHONY: all