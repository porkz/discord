import re
from hashlib import md5

import assets
import discord
from discord.ext import commands
import random
from string import digits, ascii_letters
import requests
from io import BytesIO

# Config bot
bot = assets.bot
admin_role = "Pas admin"

insultes_kikoo = [
    "tarlouze, tu t'es cru spécial à mettre des caractères à la con dans ton pseudo",
    "enflure, t'as voulu faire ta précieuse avec ton pseudo à la con et tu t'es cru malin à mettre des petites "
    "décorations en UTF-8, comme si ta personnalité en dépendait",
    "sale enfoiré, on te dérange pas avec ton pseudo gerbant",
    "grosse fiotte débile, tu t'es cru malin avec ton pseudo de raclure de fond de chiottes",
    ", écoute moi bien taffiole alcoolique, pas de pseudo d'enculé ici, c'est compris"
]


def get_md5_from_picture(message: discord.Message):
    img_url = message.attachments[0].url
    response = requests.get(img_url)
    img_bytes = BytesIO(response.content)
    md5sum = md5(img_bytes.getbuffer())
    return md5sum.hexdigest()


def valid_nickname(member: discord.Member):
    nickname = member.display_name.lower()
    whitelist = set(digits + ascii_letters + "#_-[]. ëêéèûùîôöàâäüïæœç")

    if all(char in whitelist for char in nickname):
        print("Nickname check {} - Valid".format(nickname))
        return True
    else:
        print("Nickname check {} - Invalid".format(nickname))
        return False


def message_contains_dox(message: discord.Message):
    msg = message.content.lower()
    msg_digits = ''.join([n for n in msg if n.isdigit()])
    rx_ip = re.compile(r"((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])")
    rx_numtel = re.compile(r"(^\d{10,13}$)")
    rx_email = re.compile(r"[a-z0-9]+[._]?[a-z0-9]+[@]\w+[.]\w{2,3}")
    return re.match(rx_ip, msg) or re.match(rx_numtel, msg_digits) or re.match(rx_email, msg)


async def on_message(message: discord.Message):
    try:
        if not (valid_nickname(message.author)):
            await message.channel.send("{} {} {} ? Comme c'est casse-couilles de mentionner les lobotomisés dans ton "
                                       "genre, on va changer ton pseudo et mettre ton ID Discord à la place, ce sera "
                                       "déjà moins "
                                       "gerbant.".format(message.author.mention,
                                                         random.choice(assets.replies_bonjour),
                                                         random.choice(insultes_kikoo)))
            await message.author.edit(nick=message.author.id)
            return
    except discord.errors.Forbidden:
        await message.channel.send("Bordel j'ai pas les perms !")
        return

    if message.attachments:
        await message.channel.send("md5: `{}`".format(get_md5_from_picture(message)))

    if "<@!807815417980649483>" in message.content:
        random_hello = random.choice(assets.replies_bonjour)
        await message.channel.send("{} {}.".format(random_hello, message.author.mention))
        return

    if assets.message_contains_iplogger(message):
        await message.channel.send("Dis donc {} sale enculé, tu crois que je t'ai pas vu utiliser un IP logger ? Pas "
                                   "ici.".format(message.author.mention))
        await message.delete()
        return

    if message_contains_dox(message):
        await message.channel.send("{} Potentiel Doxx détecté - et supprimé. "
                                   "Ne t'avise pas de recommencer.".format(message.author.mention))
        await message.delete()
        return


async def on_member_join(member: discord.Member):
    if not valid_nickname(member):
        await member.edit(nick=member.id)


async def on_member_remove(member: discord.Member):
    await member.send("Adios ! :( Si jamais tu veux revenir parmi nous, voici un lien d'invitation: "
                      "https://discord.gg/5uSKV57J28")


@bot.command()
@commands.has_any_role(admin_role, 'dev')
async def alias_check_names(ctx):
    members_list = ctx.guild.members
    await ctx.send(f":arrow_forward: Début de vérification des membres...")
    members_scanned_count = 0
    invalid_members_count = 0

    await ctx.send("{} membres trouvés - analyse en cours...".format(len(members_list)))
    for member in members_list:
        if not valid_nickname(member):
            await member.edit(nick=member.id)
            invalid_members_count += 1

        members_scanned_count += 1

    await ctx.send("Membres scannés : {}".format(members_scanned_count))
    await ctx.send("Pseudos de dégénéré corrigés : {}".format(invalid_members_count))
    await ctx.send(":white_check_mark: Fin de vérification des membres.")

