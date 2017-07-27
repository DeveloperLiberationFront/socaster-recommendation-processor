#!/bin/bash

DBNAME="socaster"
USER="eve"
PASSWORD="api service access"
COMMAND_TABLE=events
DETAILS_TABLE=tools

CMD_REC=command-recommender
JAR=$CMD_REC/commandrecommender-1.0-SNAPSHOT.jar
LOG_SETTINGS=log4j.xml

ACCEPTANCE=MULTI_USE
declare -a ALGORITHM_TYPES=("MOST_FREQUENTLY_USED" "MOST_WIDELY_USED" "HOTKEY_NOT_USED" "MOST_POPULAR_LEARNING_RULE" "USER_BASED_CF" "USER_BASED_CF_WITH_DISCOVERY" "LEARNING_RULE" "MOST_PREREQ_LEARNING_RULE" "ITEM_BASED_CF_WITH_DISCOVERY" "ITEM_BASED_CF" "LATENT_MODEL_BASED_CF")

function pre {
  echo Beginning recommendation generation
  #add pre-process actions here
  node pre-process.js
}

function post {
  echo Running post-process actions
  node post-process.js
  #add post-process actions here
}

# NOTE: This requires GNU getopt.  On Mac OS X and FreeBSD, you have to install this
# separately; see below.
OPTS=`getopt -o vd --long debug,verbose,log -n 'process-recommendations' -- "$@"`

# Exit if there were errors processing args
if [ $? != 0 ] ; then echo "Terminating..." >&2 ; exit 1 ; fi

# Note the quotes around `$OPTS': they are essential!
eval set -- "$OPTS"
VERBOSE=false
DEBUG=false
LOG=false

# Process arguments
while true; do
  case "$1" in
    -l | --log ) LOG=true; shift ;;
    -v | --verbose ) VERBOSE=true; shift ;;
    -d | --debug ) DEBUG=true; shift ;;
    -- ) shift; break ;;
    * ) break ;;
  esac
done

# Conditionally redirect output to /dev/null
if $DEBUG || $VERBOSE
then exec 3>&1;
else exec 3>/dev/null;
fi

# Test if running via tty or not. If so, enable logging
tty -s
if [ $? != 0 ] ; then LOG=true; fi
if $LOG
then
    exec >process.log 2>process.log
fi

pre
for type in "${ALGORITHM_TYPES[@]}"
do
    echo "Generating recommendations for ${type}..."
    java -jar -Dlog4j.configurationFile=$LOG_SETTINGS $JAR \
        >&3 2>&3 \
        --command_table $COMMAND_TABLE \
        -cu "${USER}" \
        -cpass "${PASSWORD}" \
        -cn "${DBNAME}" \
        --command_detail_table "${DETAILS_TABLE}" \
        -c $ACCEPTANCE\
        -t $type \
        $OPTIONS
done
post