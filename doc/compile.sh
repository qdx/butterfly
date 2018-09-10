for filename in ./*.mmd; do
  y=${filename%.mmd}
  ../node_modules/.bin/mmdc -i "$filename" -o "$y.png"
done
